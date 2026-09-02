'use client';
import {useState} from 'react';
import {toast} from 'sonner';
import {Button} from '../ui/button';
import {Textarea} from '../ui/textarea';
import {useAuth} from '@/lib/auth-provider';

interface AddTaskProps {
  projectId: string;
  onTaskAdded: () => void;
  editingTask?: {
    id: string;
    title: string;
    time: string;
  } | null;
  setEditingTask: (task: null) => void;
}

export default function AddTask({
  projectId,
  onTaskAdded,
  editingTask,
  setEditingTask,
}: AddTaskProps) {
  const {user} = useAuth();
  const [taskTitle, setTaskTitle] = useState(editingTask?.title ?? '');
  const [selectedTimes, setSelectedTimes] = useState<string[]>(() =>
    editingTask ? editingTask.time.split(' - ') : [],
  );

  // Keep the form in sync when the editing target changes while mounted
  // (render-time adjustment, per React docs — avoids setState-in-effect).
  const [prevEditingTask, setPrevEditingTask] = useState(editingTask);
  if (editingTask !== prevEditingTask) {
    setPrevEditingTask(editingTask);
    setTaskTitle(editingTask?.title ?? '');
    setSelectedTimes(editingTask ? editingTask.time.split(' - ') : []);
  }

  const timeSlots = Array.from(
    {length: 24},
    (_, i) => `${(1 + i).toString().padStart(2, '0')}:00`,
  );
  const handleTimeClick = (time: string) => {
    if (selectedTimes.includes(time)) {
      setSelectedTimes(selectedTimes.filter(t => t !== time));
    } else if (selectedTimes.length < 2) {
      setSelectedTimes([...selectedTimes, time]);
    } else {
      toast.error('Select only 2 times (start and end)');
    }
  };

  const [start, end] = selectedTimes.sort();
  const highlitedTimes =
    selectedTimes.length === 2
      ? timeSlots.slice(timeSlots.indexOf(start), timeSlots.indexOf(end) + 1)
      : [];

  const handleAddTask = () => {
    if (!taskTitle.trim()) {
      toast.error('Task title cannot be empty.');
      return;
    }
    if (!projectId) {
      toast.error('No project selected.');
      return;
    }
    if (selectedTimes.length !== 2) {
      toast.error('Please select a start and end time.');
      return;
    }
    if (!user) {
      toast.error('User not logged in.');
      return;
    }

    // TODO(T5): persist via the tasks API. The Mongo data layer is not wired up
    // yet, so adding/updating tasks is intentionally a no-op for now.
    toast.info('Saving tasks lands in T5 (data layer migration).');
    setTaskTitle('');
    setEditingTask(null);
    onTaskAdded();
  };
  return (
    <div>
      <div className="my-5 space-y-4">
        <div>
          <Textarea
            value={taskTitle}
            maxLength={100}
            rows={3}
            className="resize-none max-h-[60px] "
            onChange={e => setTaskTitle(e.target.value)}
            placeholder="Task title"
          />
        </div>
        <div className="grid grid-cols-4 my-3 gap-2">
          {timeSlots.map(time => (
            <Button
              key={time}
              onClick={() => handleTimeClick(time)}
              className={`py-2 rounded-4xl cursor-pointer text-sm ${
                selectedTimes.includes(time)
                  ? 'bg-blue-600 text-white'
                  : highlitedTimes.includes(time)
                  ? 'bg-blue-100 text-blue-500'
                  : 'bg-gray-100 text-gray-500'
              }`}>
              {time}
            </Button>
          ))}
        </div>
      </div>
      <div className="mt-4 mb-2 text-center">
        <Button
          onClick={handleAddTask}
          className="rounded-4xl cursor-pointer w-full"
          color="#155dfc">
          {editingTask ? 'Update Task' : 'Add Task'}
        </Button>
      </div>
    </div>
  );
}
