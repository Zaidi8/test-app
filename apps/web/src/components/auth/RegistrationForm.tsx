'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';

import {Label} from '@/components/ui/Label';
import {Button} from '../ui/button';
import {Input} from '../ui/input';
import {useAuth} from '@/lib/auth-provider';
import {ApiError} from '@/lib/api-client';

export function RegisterForm() {
  const router = useRouter();
  const {register} = useAuth();

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
      await register({name: fullName, email, password});
      // Registration signs the user in (cookies set), so go straight to the app.
      router.push('/dashboard/projects');
    } catch (err) {
      setErrorMessage(
        err instanceof ApiError
          ? err.message
          : 'Something went wrong. Please try again.',
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 2xl:space-y-8 md:min-w-[25%] mx-auto p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold text-center">Create an Account</h2>

      <div className="space-y-2">
        <Label htmlFor="fullName">First & Last Name</Label>
        <Input
          id="fullName"
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
          placeholder="At least 8 characters"
          value={password}
          onChange={e => setPassword(e.target.value)}
          required
        />
      </div>

      {errorMessage && (
        <p className="text-sm text-red-600 text-center">{errorMessage}</p>
      )}

      <div className="text-center">
        <Button
          type="submit"
          className="w-full cursor-pointer"
          disabled={isLoading}>
          {isLoading ? 'Registering...' : 'Register'}
        </Button>
      </div>

      <div className="text-center">
        <div
          onClick={() => router.back()}
          className="text-sm text-black hover:underline cursor-pointer">
          Already have an account?
        </div>
      </div>
    </form>
  );
}
