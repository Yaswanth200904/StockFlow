import { Button, Modal } from 'react-bootstrap';

export default function ConfirmDialog({
  show,
  title,
  children,
  confirmLabel = 'Delete',
  busy = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal show={show} onHide={onCancel} centered>
      <Modal.Header closeButton><Modal.Title as="h5">{title}</Modal.Title></Modal.Header>
      <Modal.Body>{children}</Modal.Body>
      <Modal.Footer>
        <Button variant="light" onClick={onCancel} disabled={busy}>Cancel</Button>
        <Button variant="danger" onClick={onConfirm} disabled={busy}>
          {busy ? 'Deleting…' : confirmLabel}
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
