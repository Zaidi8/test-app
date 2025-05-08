'use client';
import {Button} from '../ui/button';
import {X} from 'lucide-react';
import AddTask from './AddTasks';
import { useClickOutside } from '@/hooks/useClickOutside';

interface AddTaskPanelProps {
  projectId: string;
  showPanel : boolean
  setShowPanel: (value: boolean) => void;
}

export default function AddTaskPanel({projectId,showPanel,setShowPanel}: AddTaskPanelProps) {
  const ref = useClickOutside(() => setShowPanel(false));
  if (!showPanel) {
    return null;
  }
  return (
<>
      <div
      ref={ref}
        className={`fixed bottom-0 left-1/2 transform -translate-x-1/12 z-50 bg-white shadow-xl transition-transform duration-300 ease-in-out rounded-2xl ${
          showPanel ? 'bottom-[70px] translate-y-0' : 'translate-y-full '
        }`}
        style={{minHeight: '300px',width:'100%',maxWidth:'430px'}}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Create New Task</h2>
          <Button className='cursor-pointer' variant="ghost" size="icon" onClick={() => setShowPanel(false)}>
            <X />
          </Button>
        </div>
        <div className="w-full max-w-[430px] mx-auto px-2">
          <AddTask
            projectId={projectId}
            onTaskAdded={() => {
              setShowPanel(false);
            }}
          />
        </div>
        </div>
    </>
  );
}
