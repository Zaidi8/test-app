'use client';

import {useEffect, useState} from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
} from 'firebase/firestore';
import {db, auth} from '../../../firebaseConfig';
import {ProjectType} from '@/types/project';
import {Button} from '../ui/button';
import {toast} from 'sonner';
import AddProject from './AddProjects';
import {onAuthStateChanged} from 'firebase/auth';
import {MoreVertical ,CheckCircle, Circle} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';

interface AddedProjectsProps {
  selectedProjectId: string | null;
  setSelectedProjectId: (id: string) => void;
}

export default function AddedProjects({
  selectedProjectId,
  setSelectedProjectId,
}: AddedProjectsProps) {
  const [projects, setProjects] = useState<ProjectType[]>([]);
  const [editingProject, setEditingProject] = useState<ProjectType | null>(
    null,
  );

  const handleProjectAdded = () => {
    const user = auth.currentUser;
    if (!user) return;

    const q = query(collection(db, 'users', user.uid, 'projects'));
    const unsubscribe = onSnapshot(q, snapshot => {
      const fetchedProjects: ProjectType[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as ProjectType[];
      setProjects(fetchedProjects);
    });

    return () => unsubscribe();
  };

  const editProject = (project: ProjectType) => {
    setEditingProject(project);
  };

  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (!user) return;

      const q = query(collection(db, 'users', user.uid, 'projects'));
      const unsubscribeProjects = onSnapshot(q, snapshot => {
        const fetchedProjects: ProjectType[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as ProjectType[];
        setProjects(fetchedProjects);
      });

      // Cleanup Firestore listener when auth state changes or component unmounts
      return () => unsubscribeProjects();
    });

    // Cleanup auth listener
    return () => unsubscribeAuth();
  }, []);

  const toggleComplete = async (project: ProjectType) => {
    if (!project.id) return;
    try {
      await updateDoc(
        doc(db, 'users', project.userId, 'projects', project.id),
        {
          isComplete: !project.isComplete,
        },
      );
      toast.success('Status updated');
    } catch (error) {
      console.error('Failed to update status', error);
      toast.error('Could not update project');
    }
  };

  const deleteProject = async (id: string, userId: string) => {
    try {
      await deleteDoc(doc(db, 'users', userId, 'projects', id));
      toast.success('Project deleted');
    } catch (error) {
      console.error('Failed to delete project', error);
      toast.error('Could not delete project');
    }
  };

  return (
    <div className="mx-6 rounded-lg h-full bg-white">
      <div className="mx-8 pt-10">
        <div>
          {projects.map(project => (
            <div
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              className={`flex mb-2 rounded-sm items-center cursor-pointer ${
                selectedProjectId === project.id ? 'bg-gray-100' : ''
              }`}>
              <div className="flex text-sm mx-4 flex-row items-center justify-between w-full">
                <div className='flex justify-between '>
                <span className='mr-2'>{project.isComplete ? <CheckCircle size={18} color='green'/>:<Circle size={18} color='red'/>}</span>
                  <span
                    className={
                      project.isComplete
                        ? 'line-through text-muted-foreground'
                        : ''
                    }>
                    {project.title}
                  </span>
                </div>

                <div className="-mr-4">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="cursor-pointer">
                        <MoreVertical />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={e => {
                          e.stopPropagation();
                          editProject(project);
                        }}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={e => {
                          e.stopPropagation();
                          toggleComplete(project);
                        }}>
                        {project.isComplete
                          ? 'Mark Incomplete'
                          : 'Mark Complete'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={e => {
                          e.stopPropagation();
                          deleteProject(project.id!, project.userId);
                        }}>
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          ))}
        </div>
        <AddProject
          editingProject={editingProject}
          setEditingProject={setEditingProject}
          onProjectAdded={handleProjectAdded}
        />
      </div>
    </div>
  );
}
