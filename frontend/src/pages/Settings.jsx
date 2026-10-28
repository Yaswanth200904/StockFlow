import { useEffect, useState } from 'react';
import { Button, Card, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import AlertMessage from '@/components/common/AlertMessage';
import Spinner from '@/components/common/Spinner';
import * as settingsService from '@/services/settingsService';
import { errMsg } from '@/services/api';

export default function Settings() {
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState('');
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    settingsService.get()
      .then((settings) => reset({ threshold: String(settings.defaultLowStockThreshold) }))
      .catch((loadError) => setError(errMsg(loadError)))
      .finally(() => setLoaded(true));
  }, [reset]);

  const save = async ({ threshold }) => {
    try {
      setError('');
      setSaved('');
      await settingsService.update(Number(threshold));
      setSaved('Settings saved.');
    } catch (saveError) {
      setError(errMsg(saveError));
    }
  };

  if (!loaded) return <Spinner />;
  return (
    <>
      <h1 className="h3 mb-4">Settings</h1>
      <AlertMessage message={error} />
      <AlertMessage message={saved} variant="success" onClose={() => setSaved('')} />
      <Card style={{ maxWidth: 480 }}><Card.Body>
        <Form onSubmit={handleSubmit(save)} noValidate>
          <Form.Group className="mb-3" controlId="threshold">
            <Form.Label>Default low stock threshold</Form.Label>
            <Form.Control
              type="number"
              min={0}
              step={1}
              isInvalid={Boolean(errors.threshold)}
              {...register('threshold', {
                required: 'Enter a number',
                validate: (value) => Number.isInteger(Number(value)) && Number(value) >= 0 || 'Enter a whole number, 0 or more',
              })}
            />
            <Form.Text>Used for products that do not set their own threshold.</Form.Text>
            <Form.Control.Feedback type="invalid">{errors.threshold?.message}</Form.Control.Feedback>
          </Form.Group>
          <Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Saving…' : 'Save settings'}</Button>
        </Form>
      </Card.Body></Card>
    </>
  );
}
