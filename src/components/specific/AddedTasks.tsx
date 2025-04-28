'use client';

import {useEffect, useState} from 'react';
import {Card} from '../ui/card';
import {Badge} from '../ui/badge';
import {Button} from '../ui/button';
import {Checkbox} from '../ui/checkbox';
import {MoreVertical} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '../ui/dropdown-menu';
import {auth, db} from '../../../firebaseConfig';
import {
  collection,
  deleteDoc,
  doc,
  onSnapshot,
  query,
  updateDoc,
} from 'firebase/firestore';
import {toast} from 'sonner';
import {TaskType} from '@/types/project';
import AddTask from './AddTasks';

export default function AddedTasks({projectId}: {projectId: string}) {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);

  const toggleComplete = async (task: TaskType) => {
    const user = auth.currentUser;
    if (!user || !task.id) return;

    try {
      await updateDoc(
        doc(db, 'users', user.uid, 'projects', projectId, 'tasks', task.id),
        {
          isComplete: !task.isComplete,
        },
      );
      toast.success('Task updated');
    } catch (error) {
      console.error('Failed to update task', error);
      toast.error('Could not update task');
    }
  };

  const deleteTask = async (taskId: string) => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await deleteDoc(
        doc(db, 'users', user.uid, 'projects', projectId, 'tasks', taskId),
      );
      toast.success('Task deleted');
    } catch (error) {
      console.error('Failed to delete task', error);
      toast.error('Could not delete task');
    }
  };

  useEffect(() => {
    const fetchTasks = () => {
      const user = auth.currentUser;
      if (!user) return;

      const q = query(
        collection(db, 'users', user.uid, 'projects', projectId, 'tasks'),
      );
      const unsubscribe = onSnapshot(q, snapshot => {
        const fetchedTasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        })) as TaskType[];
        setTasks(fetchedTasks);
      });

      return () => unsubscribe();
    };
    const unsubscribe = fetchTasks();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [projectId]);

  return (
    <div>
      {tasks.map(task => (
        <Card key={task.id} className="mb-2 p-3 flex flex-row justify-between">
          <div className="flex items-center gap-3">
            <Checkbox
              checked={task.isComplete}
              onCheckedChange={() => toggleComplete(task)}
              className="cursor-pointer"
            />
            <p
              className={
                task.isComplete ? 'line-through text-muted-foreground' : ''
              }>
              {task.title}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Badge>{task.time}</Badge>
          </div>
          <div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="cursor-pointer">
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => setEditingTask(task)}>
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => toggleComplete(task)}>
                  {task.isComplete ? 'Mark Incomplete' : 'Mark Complete'}
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => deleteTask(task.id)}>
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </Card>
      ))}

      <AddTask
        onTaskAdded={() => {}}
        editingTask={editingTask}
        setEditingTask={setEditingTask}
        projectId={projectId}
      />
    </div>
  );
}
