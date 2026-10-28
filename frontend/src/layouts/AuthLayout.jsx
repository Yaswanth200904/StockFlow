import { Card, Container } from 'react-bootstrap';
import logo from '@/assets/logo.svg';

export default function AuthLayout({ title, subtitle, children }) {
  return (
    <Container className="d-flex flex-column justify-content-center min-vh-100 py-4" style={{ maxWidth: 460 }}>
      <div className="d-flex align-items-center gap-2 mb-3">
        <img src={logo} alt="" width="34" height="34" />
        <span className="fs-4 fw-bold">StockFlow</span>
      </div>
      <Card><Card.Body className="p-4">
        <h1 className="h4">{title}</h1>
        <p className="text-body-secondary">{subtitle}</p>
        {children}
      </Card.Body></Card>
    </Container>
  );
}
