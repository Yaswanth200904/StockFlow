# StockFlow MVP

StockFlow is an inventory management application with a React/Vite frontend and an Express + Prisma + MySQL backend.

## Requirements

- Node.js 20.19 or newer and npm
- MySQL 8 or compatible MySQL server

## 1. Create a MySQL database

Run this in a MySQL client, replacing the password with a strong local password:

```sql
CREATE DATABASE stockflow CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'stockflow'@'localhost' IDENTIFIED BY 'use-a-strong-local-password';
GRANT ALL PRIVILEGES ON stockflow.* TO 'stockflow'@'localhost';
```

The backend uses `DATABASE_URL` from its environment. URL-encode special characters in the database password.

## 2. Configure and run the backend

In PowerShell:

```powershell
Set-Location .\stockflow\backend
Copy-Item .env.example .env
```

Edit `backend\.env` and set `DATABASE_URL` to the MySQL credentials you created. Generate a fresh JWT secret (do not use the example placeholder):

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Set that value as `JWT_SECRET` in `.env`. Then run:

```powershell
npm install
npm run prisma:generate
npm run prisma:migrate
npm run dev
```

`npm run prisma:migrate` applies pending migrations without resetting existing data; `npm run prisma:migrate:dev` is available only for creating migrations during development. The API listens on `http://localhost:5000`; `GET /api/health` is an unauthenticated health check.

## 3. Configure and run the frontend

In a second PowerShell terminal:

```powershell
Set-Location .\stockflow\frontend
Copy-Item .env.example .env
npm install
npm run dev
```

For the existing Live Server setup, build the frontend and serve `stockflow/frontend/dist` at `http://127.0.0.1:5500`:

```powershell
Set-Location .\stockflow\frontend
npm install
npm run build
```

Alternatively, run `npm run dev` and open `http://localhost:5173`; set `FRONTEND_ORIGIN=http://localhost:5173` in the backend `.env` for that origin. The frontend selects the API host from the page hostname and sends the session cookie; it does not store JWTs in local storage. In production, serve both apps over HTTPS from the same site, set `NODE_ENV=production`, and set `FRONTEND_ORIGIN` to the exact frontend origin.

## Environment variables

Backend (`backend\.env`):

- `NODE_ENV`: `development`, `test`, or `production`
- `PORT`: API port (default `5000`)
- `DATABASE_URL`: MySQL connection string
- `JWT_SECRET`: private random secret, at least 32 characters
- `JWT_EXPIRES_IN`: JWT lifetime such as `1d`, `12h`, or `30m`
- `FRONTEND_ORIGIN`: exact frontend origin allowed by CORS (default `http://127.0.0.1:5500`; use `http://localhost:5173` for Vite dev server)

Frontend (`frontend\.env`):

- `VITE_API_URL`: optional API base URL (defaults to the current page hostname on port `5000`)
- `VITE_CURRENCY`: currency code used to format displayed prices (default `INR`)

## API

All application endpoints are under `/api`.

- `POST /auth/signup`, `POST /auth/login`, `POST /auth/logout`, `GET /auth/me`
- `GET /products`, `POST /products`, `GET /products/:id`, `PUT /products/:id`, `PUT /products/:id/adjust-stock`, `DELETE /products/:id`
- `GET /dashboard/summary`, `GET /dashboard/low-stock`
- `GET /settings`, `PUT /settings`

Authentication uses an HttpOnly, SameSite=Strict cookie. Protected requests resolve the user's organization from the database, and every product, dashboard, and settings query is scoped to it. Product prices, quantities, and signed stock adjustments are validated on both the client and server; adjustments are atomic, organization-scoped, and record the acting user and optional note. Organization/SKU uniqueness is enforced by MySQL.

## Tests

Run backend validation and low-stock unit tests:

```powershell
Set-Location .\stockflow\backend
npm test
```

The tenant-isolation integration test is opt-in and only runs against a database whose name contains `stockflow_test`. Create that separate database, set `STOCKFLOW_TEST_DATABASE_URL` and `JWT_SECRET`, apply migrations with that URL, then run:

```powershell
$env:STOCKFLOW_TEST_DATABASE_URL = "mysql://USERNAME:PASSWORD@localhost:3306/stockflow_test"
$env:DATABASE_URL = $env:STOCKFLOW_TEST_DATABASE_URL
npm run prisma:migrate
npm run test:integration
```

It signs up two organizations and checks that one cannot list, read, update, adjust, or delete the other's product, and that settings remain separate. Do not point this test variable at a production or shared database.

Build the frontend with:

```powershell
Set-Location .\stockflow\frontend
npm run build
```

## Workflow smoke test

1. Sign up; signup creates the owner, organization, and threshold-5 settings atomically.
2. Log out and log back in.
3. Confirm the dashboard starts at zero products and zero units.
4. Create a product; confirm it appears in the list and dashboard totals.
5. Edit its details and quantity.
6. Adjust stock inline with a positive or negative whole number; confirm it cannot become negative and that the latest note and updater are recorded.
7. Confirm low-stock status uses the product threshold when set, otherwise the organization default.
8. Change the default threshold in Settings and confirm the dashboard reflects it for products without their own threshold.
9. Delete the product through the confirmation dialog.
10. Sign up a second organization and run the tenant-isolation integration test.
