import { Form } from 'react-bootstrap';

export default function SearchBar({ value, onChange }) {
  return (
    <Form.Control
      type="search"
      value={value}
      onChange={(event) => onChange(event.target.value)}
      placeholder="Search by name or SKU"
      aria-label="Search products"
      style={{ maxWidth: 320 }}
    />
  );
}
