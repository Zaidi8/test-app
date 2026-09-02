'use client';

import {useState} from 'react';
import {Project} from '@prioritree/shared';
import {Button} from '../ui/button';
import {toast} from 'sonner';
import ProjectForm from './ProjectForm';
import {MoreVertical, CheckCircle, Circle} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import {useParams, useRouter} from 'next/navigation';
import {useProjects, useUpdateProject, useDeleteProject} from '@/services/projects';

interface ProjectListProps {
  workspaceId: string;
  onProjectSelect?: () => void;
}

export default function ProjectList({workspaceId, onProjectSelect}: ProjectListProps) {
  const {data: projects = []} = useProjects(workspaceId);
  const [editingProject, setEditingProject] = useState<Project | null>(null);
  const params = useParams();
  const router = useRouter();
  const updateProject = useUpdateProject(workspaceId);
  const deleteProject = useDeleteProject(workspaceId);

  const selectedProjectId = params?.projectId as string | undefined;
  const setSelectedProjectId = (id: string) => {
    router.push(`/dashboard/projects/${id}`);
    if (onProjectSelect) onProjectSelect();
  };

  const handleToggleComplete = async (project: Project) => {
    try {
      await updateProject.mutateAsync({
        projectId: project.id,
        data: {status: project.status === 'active' ? 'completed' : 'active'},
      });
      toast.success('Project updated');
    } catch {
      toast.error('Failed to update project');
    }
  };

  const handleDelete = async (project: Project) => {
    try {
      await deleteProject.mutateAsync(project.id);
      toast.success('Project deleted');
    } catch {
      toast.error('Failed to delete project');
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
                <div className="flex items-center justify-between ">
                  <span className="mr-2">
                    {project.status === 'completed' ? (
                      <CheckCircle size={18} color="green" />
                    ) : (
                      <Circle size={18} color="red" />
                    )}
                  </span>
                  <span
                    className={`truncate
                      ${
                        project.status === 'completed'
                          ? 'line-through text-muted-foreground'
                          : ''
                      } max-w-[140px] sm:max-w-[200px] md:max-w-[250px] lg:max-w-[300px] xl:max-w-[400px]`}>
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
                          setEditingProject(project);
                        }}>
                        Edit
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={e => {
                          e.stopPropagation();
                          handleToggleComplete(project);
                        }}>
                        {project.status === 'completed'
                          ? 'Mark Incomplete'
                          : 'Mark Complete'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer"
                        onClick={e => {
                          e.stopPropagation();
                          handleDelete(project);
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
        <ProjectForm
          workspaceId={workspaceId}
          editingProject={editingProject}
          setEditingProject={setEditingProject}
        />
      </div>
    </div>
  );
}
