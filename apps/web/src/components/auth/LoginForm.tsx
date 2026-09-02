'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import Link from 'next/link';
import {FcGoogle} from 'react-icons/fc';

import {Label} from '@/components/ui/Label';
import {Button} from '../ui/button';
import {Input} from '../ui/input';
import {useAuth} from '@/lib/auth-provider';
import {ApiError, apiUrl} from '@/lib/api-client';

export function LoginForm() {
  const router = useRouter();
  const {login} = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = () => {
    // Full-page navigation to the API, which redirects to Google's consent screen.
    window.location.href = apiUrl('/auth/google');
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      await login({email, password});
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
      onSubmit={handleLogin}
      className="space-y-6 2xl:space-y-8 md:min-w-[25%] mx-auto p-4 bg-white rounded-xl shadow-md">
      <h2 className="text-xl font-semibold text-center">Login</h2>
      <div className="space-y-2">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          placeholder="you@example.com"
          value={email}
          onChange={e => setEmail(e.target.value)}
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
        />
      </div>

      {errorMessage && (
        <p className="text-center text-sm text-red-500">{errorMessage}</p>
      )}

      <div className="text-center">
        <Button
          type="submit"
          disabled={!email || !password || isLoading}
          className="w-full cursor-pointer">
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </div>
      <div className="text-center">
        <Button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full cursor-pointer">
          Continue With Google
          <FcGoogle className="h-5 w-5" />
        </Button>
      </div>
      <div className="text-center">
        <Link
          href={'/auth/register'}
          className="text-sm text-black hover:underline cursor-pointer">
          Don&apos;t have an account?
        </Link>
      </div>
    </form>
  );
}
