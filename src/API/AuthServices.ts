import {  createUserWithEmailAndPassword,signInWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth } from "../../firebaseConfig";


export const createUser = async(
  fullname:string,  
  email:string,
  password:string
) => {
    try{

        const userCreddential = await createUserWithEmailAndPassword(auth, email, password)
    
        await updateProfile(userCreddential.user, {
          displayName:fullname,
        })
        return userCreddential.user
}
    catch(error) {
        throw error
    };
}

export const signInUser = async (email: string, password: string) => {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);

    // ✅ Force reload to fetch the updated profile (i.e., displayName)
    await userCredential.user.reload();

    // 👇 Return the updated currentUser
    return { success: true, user: auth.currentUser };
  } catch (error) {
    console.log(error);
    throw error;
  }
};
