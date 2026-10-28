import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import AlertMessage from '@/components/common/AlertMessage';
import { useAuth } from '@/hooks/useAuth';
import { errMsg } from '@/services/api';
import { ROUTES } from '@/utils/constants';

export default function Login() {
  const { login } = useAuth();
  const [error, setError] = useState('');
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const submit = async ({ email, password }) => {
    try { setError(''); await login(email, password); } catch (loginError) { setError(errMsg(loginError)); }
  };

  return (
    <AuthLayout title="Log in" subtitle="Pick up where you left off.">
      <AlertMessage message={error} />
      <Form onSubmit={handleSubmit(submit)} noValidate>
        <Form.Group className="mb-3" controlId="email">
          <Form.Label>Email</Form.Label>
          <Form.Control type="email" autoComplete="email" isInvalid={Boolean(errors.email)} {...register('email', {
            required: 'Email is required',
            pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
          })} />
          <Form.Control.Feedback type="invalid">{errors.email?.message}</Form.Control.Feedback>
        </Form.Group>
        <Form.Group className="mb-3" controlId="password">
          <Form.Label>Password</Form.Label>
          <Form.Control type="password" autoComplete="current-password" isInvalid={Boolean(errors.password)} {...register('password', {
            required: 'Password is required',
          })} />
          <Form.Control.Feedback type="invalid">{errors.password?.message}</Form.Control.Feedback>
        </Form.Group>
        <Button type="submit" className="w-100" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in…' : 'Log in'}
        </Button>
      </Form>
      <p className="mt-3 mb-0 text-center">New to StockFlow? <Link to={ROUTES.signup}>Create an account</Link></p>
    </AuthLayout>
  );
}
