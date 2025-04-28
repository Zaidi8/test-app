'use client';
import {useState, useEffect} from 'react';
import {db} from '../../firebaseConfig';
import {
  addDoc,
  updateDoc,
  doc,
  collection,
  serverTimestamp,
} from 'firebase/firestore';
import {toast} from 'sonner';
import {Button} from './ui/button'; // Assuming these components exist in your UI folder
import {Input} from './ui/input';
import {auth} from '../../firebaseConfig';
import {TaskType} from '@/types/project';
import {Card} from './ui/card';

interface AddTaskProps {
  projectId: string;
  onTaskAdded: () => void;
  editingTask: TaskType | null;
  setEditingTask: (task: TaskType | null) => void;
}

export default function AddTask({
  projectId,
  onTaskAdded,
  editingTask,
  setEditingTask,
}: AddTaskProps) {
  const [taskTitle, setTaskTitle] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAddTask = async () => {
    if (!taskTitle.trim() || !projectId) {
      toast.error('Please select a project and provide a task title.');
      return;
    }

    setLoading(true);

    try {
      const taskData = {
        title: taskTitle,
        projectId: projectId,
        createdAt: serverTimestamp(),
        time: taskTime,
      };
      const user = auth.currentUser;
      if (!user || !projectId) {
        toast.error('User not logged in or project not selected');
        return;
      }

      if (editingTask) {
        await updateDoc(
          doc(
            db,
            'users',
            user.uid,
            'projects',
            projectId,
            'tasks',
            editingTask.id,
          ),
          {
            title: taskTitle,
            time: taskTime,
          },
        );
        toast.success('Task updated successfully!');
        onTaskAdded();

        setEditingTask(null);
      } else {
        await addDoc(
          collection(db, 'users', user.uid, 'projects', projectId, 'tasks'),
          taskData,
        );
        toast.success('Task added successfully!');
      }
      setTaskTitle(''); // Clear input field after adding task
      setTaskTime(''); // Clear input field after adding task
    } catch (error) {
      console.error('Error adding task:', error);
      toast.error(editingTask ? 'Failed to update task' : 'Failed to add task');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (editingTask) {
      setTaskTitle(editingTask.title);
      setTaskTime(editingTask.time);
    }
  }, [editingTask]);

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
            ? editingTask
              ? 'Updating...'
              : 'Adding...'
            : editingTask
            ? 'Update Task'
            : 'Add Task'}
        </Button>
      </div>
    </div>
  );
}
