'use client';
import {Button} from '../ui/button';
import {X} from 'lucide-react';
import AddTask from './AddTasks';
import {useClickOutside} from '@/hooks/useClickOutside';
import {TaskType} from '@/types/project';

interface AddTaskPanelProps {
  projectId: string;
  showPanel: boolean;
  setShowPanel: (value: boolean) => void;
  editingTask: TaskType | null;
  setEditingTask: (task: TaskType | null) => void;
}

export default function AddTaskPanel({
  projectId,
  showPanel,
  setShowPanel,
  editingTask,
  setEditingTask,
}: AddTaskPanelProps) {
  const ref = useClickOutside(() => {
    setShowPanel(false);
    setEditingTask(null);
  });
  if (!showPanel) {
    return null;
  }
  return (
    <>
      <div
        ref={ref}
        className={`fixed bottom-0 left-1/2 transform -translate-x-1/2 z-50 bg-white shadow-xl transition-transform duration-300 ease-in-out rounded-2xl w-[75%] lg:w-[50%] xl:w-[35%] 2xl:w-[30%] ${
          showPanel ? 'bottom-[70px] translate-y-0' : 'translate-y-full'
        }`}
        style={{minHeight: '300px'}}>
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">
            {editingTask ? 'Update Task' : 'Create New Task'}
          </h2>
          <Button
            className="cursor-pointer"
            variant="ghost"
            size="icon"
            onClick={() => setShowPanel(false)}>
            <X />
          </Button>
        </div>
        <div className="w-full px-4 sm:px-6 md:px-8">
          <AddTask
            projectId={projectId}
            editingTask={editingTask}
            setEditingTask={setEditingTask}
            onTaskAdded={() => {
              setShowPanel(false);
            }}
          />
        </div>
      </div>
    </>
  );
}
