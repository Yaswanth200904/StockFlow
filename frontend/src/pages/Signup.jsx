import { useState } from 'react';
import { Button, Form } from 'react-bootstrap';
import { useForm } from 'react-hook-form';
import { Link } from 'react-router-dom';
import AuthLayout from '@/layouts/AuthLayout';
import AlertMessage from '@/components/common/AlertMessage';
import { useAuth } from '@/hooks/useAuth';
import { errMsg } from '@/services/api';
import { ROUTES } from '@/utils/constants';

export default function Signup() {
  const { signup } = useAuth();
  const [error, setError] = useState('');
  const { register, handleSubmit, getValues, formState: { errors, isSubmitting } } = useForm();

  const submit = async ({ email, password, organizationName }) => {
    try {
      setError('');
      await signup({ email, password, organizationName: organizationName.trim() });
    } catch (signupError) {
      setError(errMsg(signupError));
    }
  };

  const field = (name, label, type, rules, autoComplete) => (
    <Form.Group className="mb-3" controlId={name}>
      <Form.Label>{label}</Form.Label>
      <Form.Control type={type} autoComplete={autoComplete} isInvalid={Boolean(errors[name])} {...register(name, rules)} />
      <Form.Control.Feedback type="invalid">{errors[name]?.message}</Form.Control.Feedback>
    </Form.Group>
  );

  return (
    <AuthLayout title="Create your account" subtitle="Set up your store and start tracking stock.">
      <AlertMessage message={error} />
      <Form onSubmit={handleSubmit(submit)} noValidate>
        {field('organizationName', 'Organization name', 'text', {
          required: 'Organization name is required',
          maxLength: { value: 120, message: 'Maximum 120 characters' },
        })}
        {field('email', 'Email', 'email', {
          required: 'Email is required',
          pattern: { value: /^\S+@\S+\.\S+$/, message: 'Enter a valid email' },
        }, 'email')}
        {field('password', 'Password', 'password', {
          required: 'Password is required',
          minLength: { value: 8, message: 'Use at least 8 characters' },
        }, 'new-password')}
        {field('confirmPassword', 'Confirm password', 'password', {
          required: 'Confirm your password',
          validate: (value) => value === getValues('password') || 'Passwords do not match',
        }, 'new-password')}
        <Button type="submit" className="w-100" disabled={isSubmitting}>
          {isSubmitting ? 'Creating account…' : 'Create account'}
        </Button>
      </Form>
      <p className="mt-3 mb-0 text-center">Already have an account? <Link to={ROUTES.login}>Log in</Link></p>
    </AuthLayout>
  );
}
