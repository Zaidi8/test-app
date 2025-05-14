'use client';

import { useParams } from 'next/navigation';
import AddedTasks from '@/components/specific/AddedTasks';
import { getDoc,doc } from 'firebase/firestore';
import { db,auth } from '../../../../../firebaseConfig';
import { useEffect, useState } from 'react';


export default function ProjectPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [title , setTitle] = useState('');
  
  useEffect(()=>{
    const fetchProjectTitle = async () => {
      const user = auth.currentUser;
      if(!user||!projectId) return;
      
      const projectDocRef = doc(db,'users', user.uid , 'projects' , projectId);
      const projectSnap =await getDoc(projectDocRef);
      
      if (projectSnap.exists()){
        const data = projectSnap.data();
        setTitle(data.title)
      }
    }

    fetchProjectTitle();
  },[projectId])

  if (!projectId) {
    return <div className="text-center mt-10">Project ID not found.</div>;
  }

  return (
    <div className="space-y-4">
      <h1 className="text-2xl font-bold">Project {title} </h1>
      <AddedTasks/>
    </div>
  );
}
