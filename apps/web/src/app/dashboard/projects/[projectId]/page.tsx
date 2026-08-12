'use client';

import {useParams} from 'next/navigation';
import AddedTasks from '@/components/specific/AddedTasks';
import {getDoc, doc} from 'firebase/firestore';
import {db, auth} from '../../../../../firebaseConfig';
import {useEffect, useState} from 'react';
import {onAuthStateChanged} from 'firebase/auth';

export default function ProjectPage() {
  const params = useParams();
  const projectId = params?.projectId as string;
  const [title, setTitle] = useState('');
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let isMounted = true; // prevent setting state after unmount

    const unsubscribe = onAuthStateChanged(auth, async user => {
      if (!user || !projectId || !isMounted) {
        setIsLoading(false);
        return;
      }

      try {
        const projectDocRef = doc(db, 'users', user.uid, 'projects', projectId);
        const projectSnap = await getDoc(projectDocRef);

        if (projectSnap.exists() && isMounted) {
          const data = projectSnap.data();
          setTitle(data.title);
        }
      } catch (error) {
        console.error('Error fetching project title:', error);
        // Handle permission errors gracefully
        if (
          error &&
          typeof error === 'object' &&
          'code' in error &&
          error.code === 'permission-denied'
        ) {
          console.log('Permission denied - user likely signed out');
        }
      } finally {
        if (isMounted) setIsLoading(false);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, [projectId]);

  if (!projectId) {
    return <div className="text-center mt-10">Project ID not found.</div>;
  }

  return (
    <div className="space-y-4">
      {isLoading ? (
        <div className="h-6 w-auto bg-gray-200 animate-pulse rounded" />
      ) : (
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold">
          Project {title}{' '}
        </h1>
      )}
      <AddedTasks />
    </div>
  );
}
