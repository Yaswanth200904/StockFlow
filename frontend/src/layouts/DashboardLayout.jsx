import { useState } from 'react';
import { Container, Offcanvas } from 'react-bootstrap';
import { Outlet } from 'react-router-dom';
import Navbar from '@/components/layout/Navbar';
import Sidebar from '@/components/layout/Sidebar';

export default function DashboardLayout() {
  const [open, setOpen] = useState(false);
  return (
    <div className="d-flex">
      <Offcanvas show={open} onHide={() => setOpen(false)} responsive="lg" className="sf-sidebar">
        <Offcanvas.Header closeButton closeVariant="white" className="d-lg-none" />
        <Offcanvas.Body className="flex-column p-3 pt-lg-4">
          <Sidebar onNavigate={() => setOpen(false)} />
        </Offcanvas.Body>
      </Offcanvas>
      <div className="flex-grow-1" style={{ minWidth: 0 }}>
        <Navbar onMenu={() => setOpen(true)} />
        <Container fluid="xl" className="py-4 px-3 px-md-4"><Outlet /></Container>
      </div>
    </div>
  );
}
