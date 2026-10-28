import { useState } from 'react';
import { Button } from 'react-bootstrap';
import { useAuth } from '@/hooks/useAuth';
import AlertMessage from '@/components/common/AlertMessage';

export default function Navbar({ onMenu }) {
  const { user, logout } = useAuth();
  const [error, setError] = useState('');
  const signOut = async () => {
    try { setError(''); await logout(); } catch { setError('Could not contact the server to end this session.'); }
  };
  return (
    <>
      {error && <div className="px-3 pt-2"><AlertMessage message={error} /></div>}
      <header className="bg-white border-bottom px-3 py-2 d-flex align-items-center gap-3">
        <Button variant="light" className="d-lg-none" onClick={onMenu} aria-label="Open menu">☰</Button>
        <div className="ms-auto text-end lh-sm">
          <div className="fw-semibold">{user?.organizationName}</div>
          <small className="text-body-secondary">{user?.email}</small>
        </div>
        <Button variant="outline-secondary" size="sm" onClick={signOut}>Log out</Button>
      </header>
    </>
  );
}
