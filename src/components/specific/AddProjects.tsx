'use client';
import {useEffect} from 'react';
import {Button} from '../ui/button';
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import {Input} from '../ui/input';
import {useState} from 'react';
import {toast} from 'sonner';
import {ProjectType} from '@/types/project';
import {auth, db} from '../../../firebaseConfig';
import {
  addDoc,
  doc,
  collection,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore';

export default function AddProject({
  onProjectAdded,
  editingProject,
  setEditingProject,
}: {
  onProjectAdded: () => void;
  editingProject: ProjectType | null;
  setEditingProject: React.Dispatch<React.SetStateAction<ProjectType | null>>;
}) {
  const [projectName, setProjectName] = useState('');
  const [open, setOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const handleSubmitProject = async () => {
    if (!projectName.trim()) return;
    setLoading(true);

    const user = auth.currentUser;
    if (!user) {
      toast.error('User not logged in');
      setLoading(false);
      return;
    }

    try {
      if (editingProject) {
        // Update existing project
        const projectRef = doc(
          db,
          'users',
          user.uid,
          'projects',
          editingProject.id,
        );
        await updateDoc(projectRef, {
          title: projectName,
        });
        toast.success('Project updated!');
      } else {
        // Add new project
        const newProject: Omit<ProjectType, 'id' | 'createdAt'> = {
          title: projectName,
          isComplete: false,
          userId: user.uid,
        };

        await addDoc(collection(db, 'users', user.uid, 'projects'), {
          ...newProject,
          createdAt: serverTimestamp(),
        });
        toast.success('Project created!');
      }

      setProjectName('');
      setEditingProject(null); // Reset editing
      setOpen(false);
      onProjectAdded();
    } catch (error) {
      console.error('Error adding/updating project:', error);
      toast.error('Failed to add/update project');
    } finally {
      setLoading(false);
    }
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setProjectName('');
    setEditingProject(null);
  };

  useEffect(() => {
    if (editingProject) {
      setProjectName(editingProject.title);
      setOpen(true); // Auto open modal when editing
    }
  }, [editingProject]);

  return (
    <Dialog
      open={open}
      onOpenChange={isOpen => {
        if (!isOpen) {
          handleCloseDialog();
        }
        setOpen(isOpen);
      }}>
      <DialogTrigger asChild>
        <Button className="cursor-pointer mt-2">+ Add Project</Button>
      </DialogTrigger>

      <DialogContent>
        <DialogHeader>
          <DialogTitle>
            {editingProject ? 'Edit Project' : 'Add New Project'}
          </DialogTitle>
        </DialogHeader>

        <Input
          placeholder="Project name"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
        />

        <DialogFooter>
          <Button
            className="cursor-pointer"
            onClick={handleSubmitProject}
            disabled={loading}>
            {editingProject ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
