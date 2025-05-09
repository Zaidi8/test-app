'use client';
import {useState,useEffect} from 'react';
import {db} from '../../../firebaseConfig';
import {
  addDoc,
  collection,
  serverTimestamp,
  updateDoc,
  doc,
} from 'firebase/firestore';
import {toast} from 'sonner';
import {Button} from '../ui/button';
import {auth} from '../../../firebaseConfig';
import { Textarea } from '../ui/textarea';

interface AddTaskProps {
  projectId: string;
  onTaskAdded: () => void;
  editingTask? : {
    id:string;
    title:string;
    time:string;
  } | null
  setEditingTask : (task:null) => void
}

export default function AddTask({
  projectId,
  onTaskAdded,
  editingTask,
  setEditingTask
}: AddTaskProps) {
  const [taskTitle, setTaskTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedTimes, setSelectedTimes] = useState<string[]>([]);
  
  const timeSlots = Array.from({ length: 24 }, (_, i) =>
    `${(1 + i).toString().padStart(2, '0')}:00`
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

const [start , end] = selectedTimes.sort();
const highlitedTimes = selectedTimes.length === 2? timeSlots.slice(timeSlots.indexOf(start) , timeSlots.indexOf(end)+1):[];
const handleAddTask = async () => {
  
  if (!taskTitle.trim()) {
    toast.error('Task title cannot be empty.');
    return;
  }
  
  if (!projectId) {
    toast.error('No project selected.');
    return;
  }
  setLoading(true);
  
  const user = auth.currentUser;
  if (!user) {
    toast.error('User not logged in.');
    return;
  }
  
  setLoading(true);
  if (selectedTimes.length !== 2) {
    toast.error('Please select a start and end time.');
    return;
  }
  
  const [start, end] = selectedTimes.sort();
  const timeRange = `${start} - ${end}`;
  
  try {
    const taskData = {
      title: taskTitle,
      projectId,
      createdAt: serverTimestamp(),
      time: timeRange,
        isComplete: false,
      };
      if (editingTask) {
        const taskRef = doc(db, 'users', user.uid, 'projects', projectId, 'tasks', editingTask.id);
        await updateDoc(taskRef, taskData);
        toast.success('Task updated successfully!');
        setEditingTask(null)
      } else {
      await addDoc(
        collection(db, 'users', user.uid, 'projects', projectId, 'tasks'),
        taskData
      );

      const projectRef = doc(db, 'users', user.uid, 'projects', projectId);
await updateDoc(projectRef, { isComplete: false });


toast.success('Task added successfully!');
    }
setTaskTitle('');
onTaskAdded();
} catch (error) {
  console.error('Error adding task:', error);
  toast.error('Failed to add task');
} finally {
  setLoading(false);
}

};
useEffect(() => {
  if (editingTask) {
    setTaskTitle(editingTask.title);
    const [start, end] = editingTask.time.split(' - ');
    setSelectedTimes([start, end]);
  }
}, [editingTask]);
  
  return (
    <div >
      <div className='my-5 space-y-4'>
        <div >
          <Textarea
            value={taskTitle}
            maxLength={100}
            onChange={e => setTaskTitle(e.target.value)}
            placeholder="Task title"
            
            />
        </div>
        <div className="grid grid-cols-3 my-3 lg:grid-cols-4 gap-2">
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
      }`}
    >
      {time}
    </Button>
  ))}
</div>

      </div>
      <div className="mt-4 mb-2 text-center">
        <Button onClick={handleAddTask} className='rounded-4xl cursor-pointer w-full' disabled={loading} color='#155dfc'>
          {loading
            ? 
               (editingTask? 'Updating...': 'Adding...'):(editingTask? 'Update Task': 'Add Task')}
               
        </Button>
      </div>
    </div>
  );
}
