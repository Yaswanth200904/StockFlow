import { useState } from 'react';
import { Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import ProductForm from '@/components/products/ProductForm';
import AlertMessage from '@/components/common/AlertMessage';
import * as productService from '@/services/productService';
import { errMsg } from '@/services/api';
import { ROUTES } from '@/utils/constants';

export default function AddProduct() {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const save = async (data) => {
    try {
      setError('');
      await productService.create(data);
      navigate(ROUTES.products, { state: { success: 'Product created.' } });
    } catch (saveError) {
      setError(errMsg(saveError));
    }
  };

  return (
    <>
      <h1 className="h3 mb-4">Add product</h1>
      <AlertMessage message={error} />
      <Card><Card.Body><ProductForm submitLabel="Save product" onSubmit={save} onCancel={() => navigate(ROUTES.products)} /></Card.Body></Card>
    </>
  );
}
