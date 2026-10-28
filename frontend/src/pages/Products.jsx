import { useState } from 'react';
import { Button, Card } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import ProductTable from '@/components/products/ProductTable';
import SearchBar from '@/components/common/SearchBar';
import ConfirmDialog from '@/components/common/ConfirmDialog';
import AlertMessage from '@/components/common/AlertMessage';
import Spinner from '@/components/common/Spinner';
import useProducts from '@/hooks/useProducts';
import * as productService from '@/services/productService';
import { errMsg } from '@/services/api';
import { ROUTES } from '@/utils/constants';

export default function Products() {
  const [query, setQuery] = useState('');
  const { products, defaultThreshold, loading, error, reload } = useProducts(query);
  const [toDelete, setToDelete] = useState(null);
  const [busy, setBusy] = useState(false);
  const [actionError, setActionError] = useState('');
  const location = useLocation();
  const [success, setSuccess] = useState(location.state?.success ?? '');
  const navigate = useNavigate();

  const confirmDelete = async () => {
    setBusy(true);
    try {
      await productService.remove(toDelete.id);
      setToDelete(null);
      setSuccess('Product deleted.');
      await reload();
    } catch (deleteError) {
      setActionError(errMsg(deleteError));
      setToDelete(null);
    } finally {
      setBusy(false);
    }
  };

  const adjustStock = async (product, adjustment) => {
    await productService.adjustStock(product.id, adjustment);
    setSuccess(`Stock updated for ${product.name}.`);
    await reload();
  };

  return (
    <>
      <div className="d-flex flex-wrap justify-content-between align-items-center gap-2 mb-3">
        <h1 className="h3 mb-0">Products</h1>
        <Button as={Link} to={ROUTES.addProduct}>Add product</Button>
      </div>
      <AlertMessage message={error} />
      <AlertMessage message={actionError} onClose={() => setActionError('')} />
      <AlertMessage message={success} variant="success" onClose={() => setSuccess('')} />
      <Card>
        <Card.Header className="bg-white"><SearchBar value={query} onChange={setQuery} /></Card.Header>
        {loading ? <Spinner /> : products.length === 0 ? (
          <Card.Body className="text-body-secondary">
            {query.trim()
              ? 'No products match your search.'
              : 'No products yet. Add one to start tracking stock.'}
          </Card.Body>
        ) : (
          <ProductTable
            products={products}
            defaultThreshold={defaultThreshold}
            onDelete={setToDelete}
            onAdjust={adjustStock}
          />
        )}
      </Card>
      <ConfirmDialog
        show={Boolean(toDelete)}
        busy={busy}
        title="Delete product?"
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        This permanently deletes <strong>{toDelete?.name}</strong> ({toDelete?.sku}). You cannot undo this.
      </ConfirmDialog>
    </>
  );
}
