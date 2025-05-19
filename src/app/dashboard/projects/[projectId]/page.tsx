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
  const [isLaoding , setIsLaoding] = useState(true);

  
  useEffect(()=>{
    const fetchProjectTitle = async () => {
      const user = auth.currentUser;
      if(!user||!projectId) return;
      
      try{
      const projectDocRef = doc(db,'users', user.uid , 'projects' , projectId);
      const projectSnap =await getDoc(projectDocRef);
      
      if (projectSnap.exists()){
        const data = projectSnap.data();
        setTitle(data.title)
      }
    }
    catch (error){
      console.error('Error fetcing Project title:',error);
    }
    finally{
      setIsLaoding(false)
    }
  }

    fetchProjectTitle();
  },[projectId])

  if (!projectId) {
    return <div className="text-center mt-10">Project ID not found.</div>;
  }

  return (
    <div className="space-y-4">
      {isLaoding?(<div className='h-6 w-auto bg-gray-200 animate-pulse rounded'/>):(<h1 className="text-lg sm:text-xl md:text-2xl font-bold">Project {title} </h1>)}
      <AddedTasks/>
    </div>
  );
}
