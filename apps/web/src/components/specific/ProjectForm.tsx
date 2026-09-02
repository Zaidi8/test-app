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
import {Project} from '@prioritree/shared';
import {useCreateProject, useUpdateProject} from '@/services/projects';

export default function ProjectForm({
  workspaceId,
  editingProject,
  setEditingProject,
}: {
  workspaceId: string;
  editingProject: Project | null;
  setEditingProject: (project: Project | null) => void;
}) {
  const [projectName, setProjectName] = useState(editingProject?.title ?? '');
  const [open, setOpen] = useState(false);

  const createProject = useCreateProject(workspaceId);
  const updateProject = useUpdateProject(workspaceId);

  const [prevEditingProject, setPrevEditingProject] = useState(editingProject);
  if (editingProject !== prevEditingProject) {
    setPrevEditingProject(editingProject);
    setProjectName(editingProject?.title ?? '');
    setOpen(Boolean(editingProject));
  }

  const isLoading = createProject.isPending || updateProject.isPending;

  const handleSubmitProject = async () => {
    if (!projectName.trim()) return;

    try {
      if (editingProject) {
        await updateProject.mutateAsync({
          projectId: editingProject.id,
          data: {title: projectName.trim()},
        });
        toast.success('Project updated');
      } else {
        await createProject.mutateAsync({title: projectName.trim()});
        toast.success('Project created');
      }
      setProjectName('');
      setEditingProject(null);
      setOpen(false);
    } catch {
      toast.error('Failed to save project');
    }
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
        if (!isOpen) handleCloseDialog();
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
            disabled={!projectName.trim() || isLoading}>
            {isLoading ? 'Saving...' : editingProject ? 'Update' : 'Create'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
