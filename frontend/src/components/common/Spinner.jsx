import { Spinner as BootstrapSpinner } from 'react-bootstrap';

export default function Spinner({ full = false }) {
  return (
    <div className={`d-flex justify-content-center align-items-center ${full ? 'vh-100' : 'py-5'}`}>
      <BootstrapSpinner animation="border" role="status" aria-label="Loading" />
    </div>
  );
}
