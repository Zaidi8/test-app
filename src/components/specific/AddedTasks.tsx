'use client';

import {useEffect, useState} from 'react';
import {Card} from '../ui/card';
import {Button} from '../ui/button';
import {Checkbox} from '../ui/checkbox';
import {MoreVertical,Clock} from 'lucide-react';
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
  orderBy,
  getDocs
} from 'firebase/firestore';
import {toast} from 'sonner';
import {TaskType} from '@/types/project';
import AddTaskPanel from './AddTaskPanel';
import { onAuthStateChanged } from 'firebase/auth';

export default function AddedTasks({projectId}: {projectId: string}) {
  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [showPanel, setShowPanel] = useState(false);
  const [editingTask, setEditingTask] = useState<TaskType | null>(null);


  const userId = auth.currentUser?.uid;
  
const toggleComplete = async (
  userId: string,
  projectId: string,
  taskId: string,
  isNowComplete: boolean
) => {
  const taskRef = doc(db, 'users', userId, 'projects', projectId, 'tasks', taskId);

  try {
    await updateDoc(taskRef, { isComplete: isNowComplete });

    if (!isNowComplete) {
      const projectRef = doc(db, 'users', userId, 'projects', projectId);
      await updateDoc(projectRef, { isComplete: false });
      return;
    }

    const tasksSnapshot = await getDocs(
      collection(db, 'users', userId, 'projects', projectId, 'tasks')
    );

    const anyIncomplete = tasksSnapshot.docs.some(
      doc => doc.data().isComplete === false
    );

    // If all tasks are complete, mark project as complete
    if (!anyIncomplete) {
      const projectRef = doc(db, 'users', userId, 'projects', projectId);
      await updateDoc(projectRef, { isComplete: true });
    }
  } catch (error) {
    console.error('Error updating task/project status:', error);
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
        });
      } else {
        setTasks([]);
      }
    });

    return () => {
      unsubscribeAuth();
      if (unsubscribe) unsubscribe();
    };
  }, [projectId]);
  
  return (
    <div className='h-full relative'>

      {tasks.length === 0 && (
        <p className="text-muted-foreground text-center h-full content-center text-base my-4">No tasks added yet. Add one to get started!</p>
      )}    
    <div className='px-4 sm:px-6 md:px-10 lg:px-16 2xl:px-32 max-w-[1440px] mx-auto w-full'>
      {tasks.map(task => (
        <Card key={task.id} className="m-1 p-2 flex flex-col sm:flex-row  gap-2 justify-between">
          <div className="flex items-center gap-2 sm:w-[70%]">
            <Checkbox
              checked={task.isComplete}
              onCheckedChange={() =>{ 
                if (!userId) {
                  toast.error("User not logged in");
                  return;
                };
                toggleComplete(userId,projectId,task.id,!task.isComplete)}}
              className="cursor-pointer"
            />
            <p
              className={
                task.isComplete ? 'line-through text-muted-foreground truncate' : 'truncate'
              }>
              {task.title}
            </p>
          </div>
          <div className='flex flex-row justify-between self-center'>
            <div className='flex flex-row mx-2 items-center px-2 rounded-sm bg-gray-200'>
            <Clock size={16} color='#4a5565'/>
            <p className='font-medium text-xs whitespace-nowrap max-w-fit text-center text-gray-600 mx-1'>
               {task.time}
              </p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" size="icon" className="bg-gray-200 cursor-pointer">
                  <MoreVertical color='#4a5565'/>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {
                    setEditingTask(task);
                    setShowPanel(true);
                  }}
                  >
                  Edit
                </DropdownMenuItem>
                <DropdownMenuItem
                  className="cursor-pointer"
                  onClick={() => {if (!userId) {
                    toast.error("User not logged in");
                    return;
                  }
                  toggleComplete(userId,projectId,task.id,!task.isComplete)}}>
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

<Button
  onClick={() => {setShowPanel(true);
                  setEditingTask(null)
  }}
  className="fixed cursor-pointer bottom-6 left-1/2 transform -translate-x-1/2 px-6 py-3 rounded-full w-[90%] sm:w-[80%] md:w-[60%] lg:w-[40%] xl:w-[30%] max-w-[430px] shadow-lg z-50"
>
  Create a new task
</Button>
<AddTaskPanel projectId={projectId} showPanel={showPanel} setShowPanel={setShowPanel} editingTask={editingTask} setEditingTask={setEditingTask} />


    </div>
    </div>
  );
}
