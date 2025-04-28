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
import {db, auth} from '../../firebaseConfig';
import {ProjectType} from '@/types/project';
import {Card} from './ui/card';
import {Badge} from './ui/badge';
import {Button} from './ui/button';
import {toast} from 'sonner';
import AddProject from './AddProjects';
import {onAuthStateChanged} from 'firebase/auth';

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
    <div>
      <div className="mt-4 space-y-2">
        {projects.map(project => (
          <Card
            key={project.id}
            onClick={() => setSelectedProjectId(project.id)} // Update selected project on click
            className={`flex justify-between items-center p-3 border cursor-pointer ${
              selectedProjectId === project.id ? 'bg-blue-100' : '' // Change color if selected
            }`}>
            <div className="flex flex-row gap-2 justify-between w-full">
              <div>
                <span>{project.isComplete ? ' ✅ ' : ' 📌 '}</span>
                <span
                  className={
                    project.isComplete
                      ? 'line-through text-muted-foreground'
                      : ''
                  }>
                  {project.title}
                </span>
              </div>
              <div>
                <Badge variant={project.isComplete ? 'outline' : 'default'}>
                  {project.isComplete ? 'Complete' : 'Incomplete'}
                </Badge>
              </div>
            </div>
            <div className="flex flex-row justify-between w-full">
              <Button
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  toggleComplete(project);
                }}>
                Toggle
              </Button>
              <Button
                className="bg-green-500"
                size="sm"
                onClick={e => {
                  e.stopPropagation();
                  editProject(project);
                }}>
                Edit
              </Button>
              <Button
                size="sm"
                variant="destructive"
                onClick={e => {
                  e.stopPropagation();
                  deleteProject(project.id!, project.userId);
                }}>
                Delete
              </Button>
            </div>
          </Card>
        ))}
      </div>
      <AddProject
        editingProject={editingProject}
        setEditingProject={setEditingProject}
        onProjectAdded={handleProjectAdded}
      />
    </div>
  );
}
