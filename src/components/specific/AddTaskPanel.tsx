'use client';
import {useState} from 'react';
import {Button} from '../ui/button';
import {X} from 'lucide-react';
import AddTask from './AddTasks';

interface AddTaskPanelProps {
  projectId: string;
  onTaskAdded: () => void;
}

export default function AddTaskPanel({projectId, onTaskAdded}: AddTaskPanelProps) {
  const [showPanel, setShowPanel] = useState(false);

  return (
    <>
      {/* Slide-up panel */}
      <div
        className={`fixed bottom-0 left-0 right-0 z-50 bg-white shadow-xl transition-transform duration-300 ease-in-out rounded-t-2xl ${
          showPanel ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{minHeight: '300px'}}
      >
        <div className="flex justify-between items-center p-4 border-b">
          <h2 className="text-lg font-semibold">Create New Task</h2>
          <Button variant="ghost" size="icon" onClick={() => setShowPanel(false)}>
            <X />
          </Button>
        </div>
        <div className="p-4">
          <AddTask
            projectId={projectId}
            onTaskAdded={() => {
              onTaskAdded();
              setShowPanel(false);
            }}
          />
        </div>
      </div>

      {/* Bottom center button */}
      <div className="fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40">
        <Button
          onClick={() => setShowPanel(true)}
          className="px-6 py-3 rounded-full shadow-lg"
        >
          Create a new task
        </Button>
      </div>
    </>
  );
}
