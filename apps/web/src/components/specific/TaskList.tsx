'use client';

import {useState} from 'react';
import {Card} from '../ui/card';
import {Button} from '../ui/button';
import {Checkbox} from '../ui/checkbox';
import {MoreVertical, Clock} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import {toast} from 'sonner';
import {Task} from '@prioritree/shared';
import TaskPanel from './TaskPanel';
import {
  useTasks,
  useUpdateTaskStatus,
  useDeleteTask,
} from '@/services/tasks';

interface TaskListProps {
  workspaceId: string;
  projectId: string;
}

export default function TaskList({workspaceId, projectId}: TaskListProps) {
  const {data: tasks = []} = useTasks(workspaceId, projectId);
  const [showPanel, setShowPanel] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);

  const updateStatus = useUpdateTaskStatus(workspaceId, projectId);
  const deleteTask = useDeleteTask(workspaceId, projectId);

  const handleToggleComplete = async (task: Task) => {
    try {
      await updateStatus.mutateAsync({
        taskId: task.id,
        status: task.status === 'done' ? 'todo' : 'done',
      });
    } catch {
      toast.error('Failed to update task');
    }
  };

  const handleDelete = async (task: Task) => {
    try {
      await deleteTask.mutateAsync(task.id);
      toast.success('Task deleted');
    } catch {
      toast.error('Failed to delete task');
    }
  };

  return (
    <div className="h-full relative">
      {tasks.length === 0 && (
        <p className="text-muted-foreground text-center h-full content-center text-base my-4">
          No tasks added yet. Add one to get started!
        </p>
      )}
      <div className="px-4 sm:px-6 md:px-10 lg:px-16 2xl:px-32 max-w-[1440px] mx-auto w-full">
        {tasks.map(task => (
          <Card
            key={task.id}
            className="m-1 p-2 flex flex-col sm:flex-row  gap-2 justify-between">
            <div className="flex items-center mx-2 gap-2 sm:w-[60%]">
              <Checkbox
                checked={task.status === 'done'}
                onCheckedChange={() => handleToggleComplete(task)}
                className="cursor-pointer"
              />
              <p
                className={
                  task.status === 'done'
                    ? 'line-through text-muted-foreground truncate'
                    : 'truncate'
                }>
                {task.title}
              </p>
            </div>
            <div className="flex flex-row justify-between w-full sm:w-auto self-center">
              <div className="flex flex-row mx-2 items-center px-2 rounded-sm bg-gray-200">
                <Clock size={16} color="#4a5565" />
                <p className="font-medium text-xs whitespace-nowrap max-w-fit text-center text-gray-600 mx-1">
                  {task.scheduledStart && task.scheduledEnd
                    ? `${new Date(task.scheduledStart).toTimeString().slice(0, 5)} - ${new Date(task.scheduledEnd).toTimeString().slice(0, 5)}`
                    : 'No time'}
                </p>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="secondary"
                    size="icon"
                    className="bg-gray-200 cursor-pointer">
                    <MoreVertical color="#4a5565" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => {
                      setEditingTask(task);
                      setShowPanel(true);
                    }}>
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => handleToggleComplete(task)}>
                    {task.status === 'done' ? 'Mark Incomplete' : 'Mark Complete'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => handleDelete(task)}>
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </Card>
        ))}

        <Button
          onClick={() => {
            setShowPanel(true);
            setEditingTask(null);
          }}
          disabled={showPanel}
          className="fixed cursor-pointer bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%] max-w-[430px] shadow-lg z-50">
          Create a new task
        </Button>
        <TaskPanel
          workspaceId={workspaceId}
          projectId={projectId}
          showPanel={showPanel}
          setShowPanel={setShowPanel}
          editingTask={editingTask}
          setEditingTask={setEditingTask}
        />
      </div>
    </div>
  );
}
