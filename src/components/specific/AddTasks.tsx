'use client';
import {useState} from 'react';
import {db} from '../../../firebaseConfig';
import {
  addDoc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import {toast} from 'sonner';
import {Button} from '../ui/button'; // Assuming these components exist in your UI folder
import {Input} from '../ui/input';
import {auth} from '../../../firebaseConfig';
import {Card} from '../ui/card';

interface AddTaskProps {
  projectId: string;
  onTaskAdded: () => void;
}

export default function AddTask({
  projectId,
  onTaskAdded
}: AddTaskProps) {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddTask = async () => {
    setLoading(true);

    if (!taskTitle.trim()) {
      toast.error('Task title cannot be empty.');
      return;
    }
    
    if (!projectId) {
      toast.error('No project selected.');
      return;
    }
    
    const user = auth.currentUser;
    if (!user) {
      toast.error('User not logged in.');
      return;
    }
    
    setLoading(true);
    
    try {
      const taskData = {
        title: taskTitle,
        projectId,
        createdAt: serverTimestamp(),
        time: taskTime,
        isComplete: false,
      };
    
      await addDoc(
        collection(db, 'users', user.uid, 'projects', projectId, 'tasks'),
        taskData
      );
    
      toast.success('Task added successfully!');
      setTaskTitle('');
      setTaskTime('');
      onTaskAdded();
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error('Failed to add task');
    } finally {
      setLoading(false);
    }
    
  };
  
  return (
    <div>
      <Card>
        <div className="mx-4">
          <Input
            value={taskTitle}
            onChange={e => setTaskTitle(e.target.value)}
            placeholder="Task title"
          />
        </div>
        <div className="mx-4">
          <Input
            value={taskTime}
            onChange={e => setTaskTime(e.target.value)}
            placeholder="Time  e.g  08:00 - 09:00"
          />
        </div>
      </Card>
      <div className="mt-4">
        <Button onClick={handleAddTask} disabled={loading}>
          {loading
            ? 
               'Adding...':'Add Task'}
        </Button>
      </div>
    </div>
  );
}
