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
  orderBy
} from 'firebase/firestore';
import {toast} from 'sonner';
import {TaskType} from '@/types/project';
import AddTaskPanel from './AddTaskPanel';
import { Header } from '../ui/Header';
import EditProjectDialog from './EditTaskDialog';
import { onAuthStateChanged } from 'firebase/auth';

export default function AddedTasks({projectId}: {projectId: string}) {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [openDialog, setOpenDialog] = useState(false);
  const [taskName, setTaskName] = useState('');
  const [taskTime, setTaskTime] = useState('');
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);
  const [loading, setLoading] = useState(false);

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

  const handleEditSubmit = async () => {
    if (!editingTask) return;
    const user = auth.currentUser;
    if (!user) return;
  
    setLoading(true);
    try {
      await updateDoc(
        doc(db, 'users', user.uid, 'projects', projectId, 'tasks', editingTask.id),
        {
          title: taskName,
          time: taskTime,
        }
      );
      toast.success('Task updated!');
      setOpenDialog(false);
      setEditingTask(null);
    } catch (err) {
      console.error(err);
      toast.error('Failed to update task');
    } finally {
      setLoading(false);
    }
  }
  
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
    let unsubscribe: () => void;

    const unsubscribeAuth = onAuthStateChanged(auth, user => {
      if (user && projectId) {
        const q = query(
          collection(db, 'users', user.uid, 'projects', projectId, 'tasks'),
          orderBy('createdAt', 'desc')
        );

        unsubscribe = onSnapshot(q, snapshot => {
          const fetchedTasks = snapshot.docs.map(doc => ({
            id: doc.id,
            ...doc.data(),
          })) as TaskType[];

          setTasks(fetchedTasks);
          setLoading(false);
        });
      } else {
        setTasks([]);
        setLoading(false);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribe) unsubscribe();
    };
  }, [projectId]);

  return (
    <div className='mx-10'>
      <Header title='Hello ' />
      {tasks.map(task => (
        <Card key={task.id} className="m-1 p-2 flex flex-row justify-between">
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
          <div className='flex flex-row'>
            <Badge className='mx-2 bg-gray-200' variant={"secondary"}>{task.time}</Badge>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="bg-gray-200 cursor-pointer">
                  <MoreVertical />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setEditingTask(task);
                    setTaskName(task.title);
                    setTaskTime(task.time);
                    setOpenDialog(true);
                  }}
                  >
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

<EditProjectDialog
        open={openDialog}
        setOpen={setOpenDialog}
        taskName={taskName}
        setTaskName={setTaskName}
        taskTime={taskTime}
        setTaskTime={setTaskTime}
        handleSubmitTask={handleEditSubmit}
        loading={loading}
      />
<AddTaskPanel projectId={projectId} onTaskAdded={()=>{}} />

    </div>
  );
}
