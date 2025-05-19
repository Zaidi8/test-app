'use client';

import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {Label} from '@/components/ui/Label';
import {TextLink} from '../ui/TextLink';
import {Button} from '../ui/button';
import {Input} from '../ui/input';
import {signInUser} from '../../api/AuthServices';
import {signInWithGoogle} from '@/api/GoogleSignIn';
import {FcGoogle} from 'react-icons/fc';
import {FaFacebookF} from 'react-icons/fa';
import {signInWithFacebook} from '@/api/FacebookSignIn';
export function LoginForm() {
  const router = useRouter();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleGoogleSignIn = async () => {
    try {
      const user = await signInWithGoogle();
      console.log('Logged In', user);
      router.push('/dashboard/projects');
    } catch (error) {
      console.error('Google sign in failed');
    }
  };

  const handleFacebookSignIn = async () => {
    try {
      const user = await signInWithFacebook();
      console.log('Logged In', user);
      router.push('/dashboard/projects');
    } catch (error) {
      console.error('Facebook sign in failed');
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage('');

    try {
      const user = await signInUser(email, password);
      console.log('User logged in:', user);
      document.cookie = `authToken=true; path=/; max-age=86400`;
      router.push('/dashboard/projects');
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
          case 'auth/invalid-email':
            message = 'Please enter a valid email.';
            break;
          case 'auth/invalid-credential':
            message = 'The email and password you entered is not correct';
            break;
          case 'auth/user-not-found':
            message = 'No account found with this email.';
            break;
          case 'auth/wrong-password':
            message = 'Incorrect password.';
            break;
          case 'auth/network-request-failed':
            message = 'Network error. Please try again.';
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
      onSubmit={handleLogin}
      className="space-y-6 max-w-sm mx-auto p-4 bg-white rounded-xl shadow-md">
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
          className="w-full">
          {isLoading ? 'Logging in...' : 'Login'}
        </Button>
      </div>
      <div className="text-center">
        <Button onClick={handleGoogleSignIn} className="w-full">
          Continue With Google
          <FcGoogle className="h-5 w-5" />
        </Button>
      </div>
      <div className="text-center">
        <Button
          onClick={handleFacebookSignIn}
          className=" bg-blue-600 w-full text-white hover:bg-blue-700">
          <FaFacebookF className="w-5 h-5" />
          Sign in with Facebook
        </Button>
      </div>
      <div className="text-center">
        <TextLink label="Don't have an account?" href="/auth/register" />
      </div>
    </form>
  );
}
