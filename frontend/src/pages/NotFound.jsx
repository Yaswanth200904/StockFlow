import { Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { ROUTES } from '@/utils/constants';

export default function NotFound() {
  return (
    <div className="d-flex flex-column align-items-center justify-content-center min-vh-100 text-center px-3">
      <h1 className="h3">Page not found</h1>
      <p className="text-body-secondary">The page you are looking for does not exist or was moved.</p>
      <Button as={Link} to={ROUTES.dashboard}>Go to dashboard</Button>
    </div>
  );
}
