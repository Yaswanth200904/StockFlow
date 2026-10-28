import { Card } from 'react-bootstrap';

export default function SummaryCard({ label, value, warn = false }) {
  return (
    <Card className={`h-100 ${warn ? 'sf-card-warn' : ''}`}>
      <Card.Body>
        <div className="text-body-secondary mb-1">{label}</div>
        <div className="sf-stat">{value}</div>
      </Card.Body>
    </Card>
  );
}
