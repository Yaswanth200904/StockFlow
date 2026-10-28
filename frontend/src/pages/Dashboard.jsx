import { useEffect, useState } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import SummaryCard from '@/components/dashboard/SummaryCard';
import LowStockTable from '@/components/dashboard/LowStockTable';
import AlertMessage from '@/components/common/AlertMessage';
import Spinner from '@/components/common/Spinner';
import { getSummary } from '@/services/dashboardService';
import { errMsg } from '@/services/api';
import { ROUTES } from '@/utils/constants';

export default function Dashboard() {
  const [data, setData] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    getSummary().then(setData).catch((loadError) => setError(errMsg(loadError)));
  }, []);

  if (error) return <AlertMessage message={error} />;
  if (!data) return <Spinner />;

  return (
    <>
      <h1 className="h3 mb-4">Dashboard</h1>
      <Row className="g-3 mb-4">
        <Col sm={4}><SummaryCard label="Products" value={data.totalProducts} /></Col>
        <Col sm={4}><SummaryCard label="Units on hand" value={data.totalQuantity} /></Col>
        <Col sm={4}><SummaryCard label="Low stock items" value={data.lowStock.length} warn={data.lowStock.length > 0} /></Col>
      </Row>
      <Card>
        <Card.Header className="bg-white fw-semibold">Low stock items</Card.Header>
        {data.lowStock.length === 0 ? (
          <Card.Body className="text-body-secondary">
            {data.totalProducts === 0
              ? <>No products yet. <Link to={ROUTES.addProduct}>Add your first product</Link>.</>
              : 'Nothing is running low. Every product is above its threshold.'}
          </Card.Body>
        ) : <LowStockTable items={data.lowStock} />}
      </Card>
    </>
  );
}
