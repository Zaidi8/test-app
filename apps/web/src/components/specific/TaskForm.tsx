'use client';
import {useState} from 'react';
import {toast} from 'sonner';
import {Button} from '../ui/button';
import {Textarea} from '../ui/textarea';
import {useCreateTask, useUpdateTask} from '@/services/tasks';
import {Task} from '@prioritree/shared';

interface TaskFormProps {
  workspaceId: string;
  projectId: string;
  onTaskAdded: () => void;
  editingTask?: Task | null;
  setEditingTask: (task: null) => void;
}

export default function TaskForm({
  workspaceId,
  projectId,
  onTaskAdded,
  editingTask,
  setEditingTask,
}: TaskFormProps) {
  const [taskTitle, setTaskTitle] = useState(editingTask?.title ?? '');
  const [selectedTimes, setSelectedTimes] = useState<string[]>(() =>
    editingTask?.scheduledStart && editingTask?.scheduledEnd
      ? [
          new Date(editingTask.scheduledStart).toTimeString().slice(0, 5),
          new Date(editingTask.scheduledEnd).toTimeString().slice(0, 5),
        ]
      : [],
  );

  const createTask = useCreateTask(workspaceId, projectId);
  const updateTask = useUpdateTask(workspaceId, projectId);

  const [prevEditingTask, setPrevEditingTask] = useState(editingTask);
  if (editingTask !== prevEditingTask) {
    setPrevEditingTask(editingTask);
    setTaskTitle(editingTask?.title ?? '');
    setSelectedTimes(
      editingTask?.scheduledStart && editingTask?.scheduledEnd
        ? [
            new Date(editingTask.scheduledStart).toTimeString().slice(0, 5),
            new Date(editingTask.scheduledEnd).toTimeString().slice(0, 5),
          ]
        : [],
    );
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

  const isLoading = createTask.isPending || updateTask.isPending;

  const handleAddTask = async () => {
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

    const [sortedStart, sortedEnd] = selectedTimes.sort();
    const today = new Date().toISOString().split('T')[0];
    const scheduledStart = new Date(`${today}T${sortedStart}:00`).toISOString();
    const scheduledEnd = new Date(`${today}T${sortedEnd}:00`).toISOString();

    try {
      if (editingTask) {
        await updateTask.mutateAsync({
          taskId: editingTask.id,
          data: {title: taskTitle.trim(), scheduledStart, scheduledEnd},
        });
        toast.success('Task updated');
      } else {
        await createTask.mutateAsync({
          title: taskTitle.trim(),
          priority: 3,
          tags: [],
          scheduledStart,
          scheduledEnd,
        });
        toast.success('Task created');
      }
      setTaskTitle('');
      setEditingTask(null);
      onTaskAdded();
    } catch {
      toast.error('Failed to save task');
    }
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
          disabled={isLoading}
          color="#155dfc">
          {isLoading
            ? 'Saving...'
            : editingTask
            ? 'Update Task'
            : 'Add Task'}
        </Button>
      </div>
    </div>
  );
}
