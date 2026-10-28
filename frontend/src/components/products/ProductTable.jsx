import { useState } from 'react';
import { Button, Col, Form, Row, Table } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import StockBadge from './StockBadge';
import { formatMoney } from '@/utils/formatters';
import { errMsg } from '@/services/api';

function ProductRow({ product, defaultThreshold, onDelete, onAdjust }) {
  const [adjusting, setAdjusting] = useState(false);
  const [adjustment, setAdjustment] = useState('');
  const [note, setNote] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submitAdjustment = async (event) => {
    event.preventDefault();
    const units = Number(adjustment);
    if (!Number.isSafeInteger(units) || units === 0) {
      setError('Enter a non-zero whole number of units to add or remove.');
      return;
    }

    setBusy(true);
    setError('');
    try {
      await onAdjust(product, { adjustment: units, note: note.trim() });
      setAdjustment('');
      setNote('');
      setAdjusting(false);
    } catch (adjustError) {
      setError(errMsg(adjustError));
    } finally {
      setBusy(false);
    }
  };

  return (
    <>
      <tr>
        <td>
          <div className="fw-semibold">{product.name}</div>
          {product.description && <small className="text-body-secondary">{product.description}</small>}
        </td>
        <td className="text-body-secondary">{product.sku}</td>
        <td><StockBadge product={product} defaultThreshold={defaultThreshold} /></td>
        <td className="text-end">
          <div>{product.quantity}</div>
          {product.lastStockAdjustmentNote && (
            <small className="text-body-secondary">{product.lastStockAdjustmentNote}</small>
          )}
        </td>
        <td className="text-end">{formatMoney(product.sellingPrice)}</td>
        <td className="text-end text-nowrap">
          <Button
            variant="outline-primary"
            size="sm"
            className="me-2"
            aria-expanded={adjusting}
            onClick={() => setAdjusting((value) => !value)}
          >
            Adjust stock
          </Button>
          <Button as={Link} to={`/products/${product.id}/edit`} variant="outline-secondary" size="sm" className="me-2">
            Edit
          </Button>
          <Button variant="outline-danger" size="sm" onClick={() => onDelete(product)}>
            Delete
          </Button>
        </td>
      </tr>
      {adjusting && (
        <tr>
          <td colSpan={6}>
            <Form onSubmit={submitAdjustment}>
              {error && <div className="text-danger small mb-2" role="alert">{error}</div>}
              <Row className="g-2 align-items-end">
                <Col xs={12} sm={3}>
                  <Form.Label htmlFor={`stock-adjustment-${product.id}`}>Units (+/-)</Form.Label>
                  <Form.Control
                    id={`stock-adjustment-${product.id}`}
                    type="number"
                    step="1"
                    required
                    value={adjustment}
                    onChange={(event) => setAdjustment(event.target.value)}
                    disabled={busy}
                    placeholder="e.g. 5 or -2"
                  />
                </Col>
                <Col xs={12} sm={6}>
                  <Form.Label htmlFor={`stock-note-${product.id}`}>Note (optional)</Form.Label>
                  <Form.Control
                    id={`stock-note-${product.id}`}
                    type="text"
                    maxLength={500}
                    value={note}
                    onChange={(event) => setNote(event.target.value)}
                    disabled={busy}
                    placeholder="Reason for the stock change"
                  />
                </Col>
                <Col xs={12} sm="auto">
                  <Button type="submit" disabled={busy}>
                    {busy ? 'Updating…' : 'Apply adjustment'}
                  </Button>
                </Col>
              </Row>
            </Form>
          </td>
        </tr>
      )}
    </>
  );
}

export default function ProductTable({ products, defaultThreshold, onDelete, onAdjust }) {
  return (
    <div className="table-responsive">
      <Table hover className="align-middle mb-0">
        <thead>
          <tr>
            <th>Product</th><th>SKU</th><th>Status</th>
            <th className="text-end">Quantity / Latest adjustment</th><th className="text-end">Selling price</th>
            <th className="text-end">Actions</th>
          </tr>
        </thead>
        <tbody>
          {products.map((product) => (
            <ProductRow
              key={product.id}
              product={product}
              defaultThreshold={defaultThreshold}
              onDelete={onDelete}
              onAdjust={onAdjust}
            />
          ))}
        </tbody>
      </Table>
    </div>
  );
}
