'use client';

import {useState} from 'react';
import {Label} from '@/components/ui/Label';
import {TextLink} from '../ui/TextLink';
import {Button} from '../ui/button';
import {Input} from '../ui/input';
import {createUser} from '../../api/AuthServices';
import {useRouter} from 'next/navigation';

export function RegisterForm() {
  const router = useRouter();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await createUser(fullName, email, password);
      console.log('User registered:', user);
      router.back();
    } catch (err: unknown) {
      let message = 'Something went wrong. Please try again.';

      if (
        typeof err === 'object' &&
        err !== null &&
        'code' in err &&
        'message' in err
      ) {
        const code = (err as {code: string; message: string}).code;

        switch (code) {
          case 'auth/email-already-in-use':
            message = 'This email is already in use.';
            break;
          case 'auth/invalid-email':
            message = 'Please enter a valid email.';
            break;
          case 'auth/weak-password':
            message = 'Password should be at least 6 characters.';
            break;
          case 'auth/network-request-failed':
            message = 'Network request failed. Please try again.';
            break;
          default:
            message = (err as {message: string}).message;
            break;
        }
      }

      setErrorMessage(message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 max-w-sm mx-auto p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold text-center">Create an Account</h2>

      <div className="space-y-2">
        <Label htmlFor="email">First & Last Name</Label>
        <Input
          id="email"
          placeholder="e.g John Doe"
          value={fullName}
          onChange={e => setFullName(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
          required
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          placeholder="********"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-600 text-center">{errorMessage}</p>
      )}

      <div className="text-center">
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </Button>
      </div>

      <div className="text-center">
        <TextLink label="Already have an account?" href="/auth/login" />
      </div>
    </form>
  );
}
