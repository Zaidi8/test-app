'use client';

import {useEffect, useState} from 'react';
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  deleteDoc,
  getDocs,
  writeBatch,
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

      if (!project.isComplete){
        const taskRef = collection(db, 'users',project.userId , 'projects' , project.id , 'tasks')
        const taskSnapshot = await getDocs(taskRef)

        const batch = writeBatch(db);
        taskSnapshot.forEach(task => {
          batch.update(task.ref , {isComplete: true});
        });
        await batch.commit();
      }
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
    <div className="mx-auto w-full sm:min-w-[250px] max-w-full lg:max-w-md xl:max-w-lg 2xl:max-w-xl rounded-lg h-full bg-white">
      <div className="px-4 sm:px-6 lg:px-8 xl:px-10 pt-6 sm:pt-8 lg:pt-10"> 
        <div>
          {projects.map(project => (
            <div
              key={project.id}
              onClick={() => setSelectedProjectId(project.id)}
              className={`flex mb-2 rounded-sm items-center cursor-pointer ${
                selectedProjectId === project.id ? 'bg-gray-100' : ''
              }`}>
              <div className="flex text-sm lg:text-base xl:text-lg mx-4 flex-row items-center justify-between w-full">
                <div className='flex items-center justify-between '>
                <span className='mr-2'>
                  {project.isComplete ?
                   <CheckCircle size={18} color='green'/>:
                   <Circle size={18} color='red'/>}</span>
                  <span
                    className={`truncate 
                      ${project.isComplete? 
                        'line-through text-muted-foreground'
                        : ''
                      } max-w-[140px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-[300px] xl:max-w-[400px]`}
                      >
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
