import { Badge } from 'react-bootstrap';
import { isLowStock } from '@/utils/stock';

export default function StockBadge({ product, defaultThreshold }) {
  const low = isLowStock(product, defaultThreshold);
  return <Badge bg={low ? 'danger' : 'success'}>{low ? 'Low stock' : 'In stock'}</Badge>;
}
