import test from 'node:test';
import assert from 'node:assert/strict';

const databaseUrl = process.env.STOCKFLOW_TEST_DATABASE_URL;
let safeTestDatabase = false;
try {
  safeTestDatabase = Boolean(databaseUrl && new URL(databaseUrl).pathname.includes('stockflow_test'));
} catch {
  safeTestDatabase = false;
}

test('organizations cannot access another organization products or settings', {
  skip: !safeTestDatabase,
}, async () => {
  process.env.DATABASE_URL = databaseUrl;
  process.env.JWT_SECRET ||= 'test-secret-with-at-least-thirty-two-characters';

  const [{ default: app }, { prisma }] = await Promise.all([
    import('../src/app.js'),
    import('../src/db/prisma.js'),
  ]);
  const server = app.listen(0);
  await new Promise((resolve) => server.once('listening', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}/api`;
  const suffix = `${Date.now()}-${Math.random().toString(36).slice(2)}`;
  const emails = [`first-${suffix}@example.test`, `second-${suffix}@example.test`];
  const organizationIds = [];
  let firstUserId;

  async function request(path, { cookie, method = 'GET', body } = {}) {
    const response = await fetch(`${baseUrl}${path}`, {
      method,
      headers: {
        ...(cookie ? { Cookie: cookie } : {}),
        ...(body ? { 'Content-Type': 'application/json' } : {}),
      },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    const setCookie = response.headers.get('set-cookie');
    return {
      response,
      cookie: setCookie?.split(';', 1)[0],
      data: response.status === 204 ? null : await response.json(),
    };
  }

  try {
    const first = await request('/auth/signup', {
      method: 'POST',
      body: { email: emails[0], password: 'integration-password', organizationName: 'First Org' },
    });
    const second = await request('/auth/signup', {
      method: 'POST',
      body: { email: emails[1], password: 'integration-password', organizationName: 'Second Org' },
    });
    assert.equal(first.response.status, 201);
    assert.equal(second.response.status, 201);
    assert.equal('passwordHash' in first.data.user, false);

    const duplicateSignup = await request('/auth/signup', {
      method: 'POST',
      body: { email: emails[0], password: 'integration-password', organizationName: 'Duplicate Org' },
    });
    assert.equal(duplicateSignup.response.status, 409);

    const invalidLogin = await request('/auth/login', {
      method: 'POST',
      body: { email: emails[0], password: 'wrong-password' },
    });
    assert.equal(invalidLogin.response.status, 401);

    const users = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { id: true, organizationId: true, email: true },
    });
    organizationIds.push(...users.map((user) => user.organizationId));
    firstUserId = users.find((user) => user.email === emails[0]).id;

    const currentUser = await request('/auth/me', { cookie: first.cookie });
    assert.equal(currentUser.data.user.email, emails[0]);

    const initialSummary = await request('/dashboard/summary', { cookie: first.cookie });
    assert.deepEqual(initialSummary.data, { totalProducts: 0, totalQuantity: 0, lowStock: [] });

    await request('/auth/logout', { cookie: first.cookie, method: 'POST' });
    const login = await request('/auth/login', {
      method: 'POST',
      body: { email: emails[0], password: 'integration-password' },
    });
    assert.equal(login.response.status, 200);

    const created = await request('/products', {
      method: 'POST',
      cookie: login.cookie,
      body: { name: 'Private item', sku: 'PRIVATE-1', quantity: 7 },
    });
    assert.equal(created.response.status, 201);
    assert.equal(
      (await prisma.product.findUnique({ where: { id: created.data.id } })).lastUpdatedBy,
      firstUserId,
    );
    const ownProduct = await request(`/products/${created.data.id}`, { cookie: login.cookie });
    assert.equal(ownProduct.response.status, 200);
    assert.equal(ownProduct.data.sku, 'PRIVATE-1');
    assert.equal((await request('/products?search=PRIVATE-1', { cookie: login.cookie })).data.length, 1);
    assert.deepEqual((await request('/products?search=not-found', { cookie: login.cookie })).data, []);
    assert.deepEqual(
      await request('/dashboard/summary', { cookie: login.cookie }).then((result) => result.data),
      { totalProducts: 1, totalQuantity: 7, lowStock: [] },
    );
    assert.equal((await request('/products', {
      cookie: login.cookie,
      method: 'POST',
      body: { name: 'Duplicate SKU', sku: 'PRIVATE-1' },
    })).response.status, 409);

    const updated = await request(`/products/${created.data.id}`, {
      cookie: login.cookie,
      method: 'PUT',
      body: { quantity: 5 },
    });
    assert.equal(updated.data.quantity, 5);
    assert.equal(
      (await prisma.product.findUnique({ where: { id: created.data.id } })).lastUpdatedBy,
      firstUserId,
    );

    const adjusted = await request(`/products/${created.data.id}/adjust-stock`, {
      cookie: login.cookie,
      method: 'PUT',
      body: { adjustment: 3, note: 'Restocked after count' },
    });
    assert.equal(adjusted.response.status, 200);
    assert.equal(adjusted.data.quantity, 8);
    assert.equal(adjusted.data.lastStockAdjustmentNote, 'Restocked after count');
    const adjustedAgain = await request(`/products/${created.data.id}/adjust-stock`, {
      cookie: login.cookie,
      method: 'PUT',
      body: { adjustment: -3, note: 'Count correction' },
    });
    assert.equal(adjustedAgain.response.status, 200);
    assert.equal(adjustedAgain.data.quantity, 5);
    assert.equal(adjustedAgain.data.lastStockAdjustmentNote, 'Count correction');
    assert.equal(
      (await prisma.product.findUnique({ where: { id: created.data.id } })).lastUpdatedBy,
      firstUserId,
    );
    assert.equal((await request(`/products/${created.data.id}/adjust-stock`, {
      cookie: login.cookie,
      method: 'PUT',
      body: { adjustment: 0 },
    })).response.status, 400);
    assert.equal((await request(`/products/${created.data.id}/adjust-stock`, {
      cookie: login.cookie,
      method: 'PUT',
      body: { adjustment: -6 },
    })).response.status, 409);

    const lowStock = await request('/dashboard/low-stock', { cookie: login.cookie });
    assert.deepEqual(lowStock.data.map((item) => item.threshold), [5]);

    const list = await request('/products', { cookie: second.cookie });
    assert.equal(list.response.status, 200);
    assert.deepEqual(list.data, []);
    assert.equal((await request(`/products/${created.data.id}`, { cookie: second.cookie })).response.status, 404);
    assert.equal((await request(`/products/${created.data.id}`, {
      cookie: second.cookie,
      method: 'PUT',
      body: { quantity: 0 },
    })).response.status, 404);
    assert.equal((await request(`/products/${created.data.id}/adjust-stock`, {
      cookie: second.cookie,
      method: 'PUT',
      body: { adjustment: 1 },
    })).response.status, 404);
    assert.equal((await request(`/products/${created.data.id}`, {
      cookie: second.cookie,
      method: 'DELETE',
    })).response.status, 404);

    await request('/settings', {
      cookie: login.cookie,
      method: 'PUT',
      body: { defaultLowStockThreshold: 8 },
    });
    const changedDefault = await request('/dashboard/low-stock', { cookie: login.cookie });
    assert.equal(changedDefault.data[0].threshold, 8);

    const explicitThreshold = await request('/products', {
      cookie: login.cookie,
      method: 'POST',
      body: { name: 'Explicit threshold item', sku: 'PRIVATE-2', quantity: 3, lowStockThreshold: 2 },
    });
    assert.equal(explicitThreshold.response.status, 201);
    const lowStockAfterCreate = await request('/dashboard/low-stock', { cookie: login.cookie });
    assert.deepEqual(lowStockAfterCreate.data.map((item) => item.sku), ['PRIVATE-1']);

    await request('/settings', {
      cookie: second.cookie,
      method: 'PUT',
      body: { defaultLowStockThreshold: 1 },
    });
    const firstSettings = await request('/settings', { cookie: login.cookie });
    assert.equal(firstSettings.data.defaultLowStockThreshold, 8);

    const deleted = await request(`/products/${created.data.id}`, { cookie: login.cookie, method: 'DELETE' });
    assert.equal(deleted.response.status, 204);
    assert.equal((await request(`/products/${created.data.id}`, { cookie: login.cookie })).response.status, 404);
    const deletedExplicit = await request(`/products/${explicitThreshold.data.id}`, { cookie: login.cookie, method: 'DELETE' });
    assert.equal(deletedExplicit.response.status, 204);
    assert.deepEqual((await request('/products', { cookie: login.cookie })).data, []);
  } finally {
    const users = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { organizationId: true },
    });
    const idsToDelete = [...new Set([...organizationIds, ...users.map((user) => user.organizationId)])];
    if (idsToDelete.length) {
      await prisma.organization.deleteMany({ where: { id: { in: idsToDelete } } });
    }
    await new Promise((resolve) => server.close(resolve));
    await prisma.$disconnect();
  }
});
