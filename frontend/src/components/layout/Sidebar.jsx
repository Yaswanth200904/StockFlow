import { Nav } from 'react-bootstrap';
import { NavLink } from 'react-router-dom';
import logo from '@/assets/logo.svg';
import { ROUTES } from '@/utils/constants';

const links = [
  { to: ROUTES.dashboard, label: 'Dashboard' },
  { to: ROUTES.products, label: 'Products' },
  { to: ROUTES.settings, label: 'Settings' },
];

export default function Sidebar({ onNavigate }) {
  return (
    <>
      <div className="d-flex align-items-center gap-2 mb-4 px-2">
        <img src={logo} alt="" width="30" height="30" />
        <span className="fs-5 fw-bold">StockFlow</span>
      </div>
      <Nav className="flex-column gap-1" onClick={onNavigate}>
        {links.map((link) => (
          <Nav.Link key={link.to} as={NavLink} to={link.to}>{link.label}</Nav.Link>
        ))}
      </Nav>
    </>
  );
}
