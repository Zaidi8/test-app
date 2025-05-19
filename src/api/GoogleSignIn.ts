// services/authService.ts
import { auth } from '../../firebaseConfig';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

export const signInWithGoogle = async () => {
  const provider = new GoogleAuthProvider();

  try {
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    // Optional: Save user data or token here
    console.log('Google user:', user);
    return user;
  } catch (error) {
    console.error('Google Sign-In Error:', error);
    throw error;
  }
};
