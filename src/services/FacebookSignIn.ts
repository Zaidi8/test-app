// services/facebook.ts
import { FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebaseConfig';

export const signInWithFacebook = async () => {
  const provider = new FacebookAuthProvider();
  try {
    const result = await signInWithPopup(auth, provider);
    // User is signed in
    return result.user;
  } catch (error) {
    console.error('Facebook sign-in error:', error);
    throw error;
  }
};
