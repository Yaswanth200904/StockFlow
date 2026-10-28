import { Table } from 'react-bootstrap';

export default function LowStockTable({ items }) {
  return (
    <div className="table-responsive">
      <Table className="align-middle mb-0">
        <thead><tr><th>Name</th><th>SKU</th><th className="text-end">On hand</th><th className="text-end">Threshold</th></tr></thead>
        <tbody>
          {items.map((product) => (
            <tr key={product.id}>
              <td className="fw-medium">{product.name}</td>
              <td className="text-body-secondary">{product.sku}</td>
              <td className="text-end fw-semibold text-danger">{product.quantity}</td>
              <td className="text-end">{product.threshold}</td>
            </tr>
          ))}
        </tbody>
      </Table>
    </div>
  );
}
