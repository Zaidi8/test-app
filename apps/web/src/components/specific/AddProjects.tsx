'use client';
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
import {useAuth} from '@/lib/auth-provider';

export default function AddProject({
  editingProject,
  setEditingProject,
}: {
  editingProject: ProjectType | null;
  setEditingProject: React.Dispatch<React.SetStateAction<ProjectType | null>>;
}) {
  const {user} = useAuth();
  const [projectName, setProjectName] = useState(editingProject?.title ?? '');
  const [open, setOpen] = useState(false);

  // Keep the form in sync when the target project changes (render-time adjustment,
  // per React docs — avoids setState-in-effect).
  const [prevEditingProject, setPrevEditingProject] = useState(editingProject);
  if (editingProject !== prevEditingProject) {
    setPrevEditingProject(editingProject);
    setProjectName(editingProject?.title ?? '');
    setOpen(Boolean(editingProject));
  }

  const handleSubmitProject = () => {
    if (!projectName.trim()) return;
    if (!user) {
      toast.error('User not logged in');
      return;
    }

    // TODO(T5): persist via the projects API. The Mongo data layer is not wired
    // up yet, so creating/updating projects is intentionally a no-op for now.
    toast.info('Saving projects lands in T5 (data layer migration).');
    setProjectName('');
    setEditingProject(null);
    setOpen(false);
  };

  const handleCloseDialog = () => {
    setOpen(false);
    setProjectName('');
    setEditingProject(null);
  };

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
            disabled={!projectName.trim()}>
            {editingProject ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
