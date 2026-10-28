import { Button, Col, Form, Row } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { productPayload } from '@/utils/formatters';

export default function ProductForm({ initial, submitLabel, onSubmit, onCancel }) {
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
    defaultValues: {
      name: initial?.name ?? '',
      sku: initial?.sku ?? '',
      description: initial?.description ?? '',
      quantity: String(initial?.quantity ?? 0),
      costPrice: initial?.costPrice ?? '',
      sellingPrice: initial?.sellingPrice ?? '',
      lowStockThreshold: initial?.lowStockThreshold ?? '',
    },
  });

  const field = (name, label, options = {}) => (
    <Form.Group className="mb-3" controlId={name}>
      <Form.Label>{label}</Form.Label>
      <Form.Control
        isInvalid={Boolean(errors[name])}
        {...register(name, options.rules)}
        type={options.type || 'text'}
        min={options.min}
        step={options.step}
      />
      {options.help && <Form.Text>{options.help}</Form.Text>}
      <Form.Control.Feedback type="invalid">{errors[name]?.message}</Form.Control.Feedback>
    </Form.Group>
  );

  const submit = (values) => onSubmit(productPayload(values));

  return (
    <Form onSubmit={handleSubmit(submit)} noValidate>
      <Row>
        <Col md={7}>{field('name', 'Product name', { rules: { required: 'Name is required', maxLength: { value: 160, message: 'Maximum 160 characters' } } })}</Col>
        <Col md={5}>{field('sku', 'SKU', { rules: { required: 'SKU is required', maxLength: { value: 80, message: 'Maximum 80 characters' } } })}</Col>
      </Row>
      <Form.Group className="mb-3" controlId="description">
        <Form.Label>Description</Form.Label>
        <Form.Control as="textarea" rows={3} {...register('description', { maxLength: { value: 5000, message: 'Maximum 5000 characters' } })} isInvalid={Boolean(errors.description)} />
        <Form.Control.Feedback type="invalid">{errors.description?.message}</Form.Control.Feedback>
      </Form.Group>
      <Row>
        <Col md={4}>{field('quantity', 'Quantity on hand', { type: 'number', min: 0, step: 1, rules: { required: 'Quantity is required', validate: (v) => Number.isInteger(Number(v)) && Number(v) >= 0 || 'Enter a whole number, 0 or more' } })}</Col>
        <Col md={4}>{field('costPrice', 'Cost price', { type: 'number', min: 0, step: '0.01', rules: { validate: (v) => v === '' || (Number.isFinite(Number(v)) && Number(v) >= 0 && Math.abs(Number(v) * 100 - Math.round(Number(v) * 100)) < 1e-8) || 'Enter a valid price with at most 2 decimal places' } })}</Col>
        <Col md={4}>{field('sellingPrice', 'Selling price', { type: 'number', min: 0, step: '0.01', rules: { validate: (v) => v === '' || (Number.isFinite(Number(v)) && Number(v) >= 0 && Math.abs(Number(v) * 100 - Math.round(Number(v) * 100)) < 1e-8) || 'Enter a valid price with at most 2 decimal places' } })}</Col>
      </Row>
      {field('lowStockThreshold', 'Product low-stock threshold', {
        type: 'number',
        min: 0,
        step: 1,
        help: 'Leave blank to use the organization default.',
        rules: { validate: (v) => v === '' || (Number.isInteger(Number(v)) && Number(v) >= 0) || 'Enter a whole number, 0 or more' },
      })}
      <div className="d-flex gap-2">
        <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : submitLabel}</Button>
        <Button type="button" variant="light" onClick={onCancel} disabled={isSubmitting}>Cancel</Button>
      </div>
    </Form>
  );
}
