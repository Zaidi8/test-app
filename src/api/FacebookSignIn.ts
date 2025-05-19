// authService.ts or inside a handler
import { FacebookAuthProvider, signInWithPopup } from 'firebase/auth';
import { auth } from '../../firebaseConfig'; // Adjust path as needed

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
