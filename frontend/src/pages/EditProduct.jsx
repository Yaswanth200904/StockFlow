import { useEffect, useState } from 'react';
import { Card } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import ProductForm from '@/components/products/ProductForm';
import AlertMessage from '@/components/common/AlertMessage';
import Spinner from '@/components/common/Spinner';
import * as productService from '@/services/productService';
import { errMsg } from '@/services/api';
import { ROUTES } from '@/utils/constants';

export default function EditProduct() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    productService.get(id).then(setProduct).catch((loadError) => setError(errMsg(loadError)));
  }, [id]);

  const save = async (data) => {
    try {
      setError('');
      await productService.update(id, data);
      navigate(ROUTES.products, { state: { success: 'Product updated.' } });
    } catch (saveError) {
      setError(errMsg(saveError));
    }
  };

  return (
    <>
      <h1 className="h3 mb-4">Edit product</h1>
      <AlertMessage message={error} />
      {!product ? (error ? null : <Spinner />) : (
        <Card><Card.Body><ProductForm initial={product} submitLabel="Save changes" onSubmit={save} onCancel={() => navigate(ROUTES.products)} /></Card.Body></Card>
      )}
    </>
  );
}
