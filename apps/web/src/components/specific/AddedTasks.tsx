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
import {TaskType} from '@/types/project';
import AddTaskPanel from './AddTaskPanel';
import {useParams} from 'next/navigation';

export default function AddedTasks() {
  const {projectId} = useParams() as {projectId: string};
  // TODO(T5): load tasks via the tasks API (TanStack Query). Until the Mongo
  // data layer lands the list is intentionally empty.
  const [tasks] = useState<TaskType[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);

  const notifyPending = () =>
    toast.info('Task changes land in T5 (data layer migration).');

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
                checked={task.isComplete}
                onCheckedChange={() => notifyPending()}
                className="cursor-pointer"
              />
              <p
                className={
                  task.isComplete
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
                  {task.time}
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
                    onClick={() => notifyPending()}>
                    {task.isComplete ? 'Mark Incomplete' : 'Mark Complete'}
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    className="cursor-pointer"
                    onClick={() => notifyPending()}>
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
        <AddTaskPanel
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
