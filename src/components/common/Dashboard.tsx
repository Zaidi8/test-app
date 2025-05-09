'use client';

import AddedProjects from '../specific/AddedProjects';
import AddedTasks from '../specific/AddedTasks';
import { useProjectStore } from '@/store/projectStore';



export default function Dashboard() {
  const selectedProjectId = useProjectStore(state => state.selectedProjectId);
  const setSelectedProjectId = useProjectStore(state => state.setSelectedProjectId);
  return (
    <div className='bg-gray-100 min-h-screen '>

    <div className="hidden md:grid grid-cols-10 min-h-screen">
      <aside className="col-span-3 border-r p-4">
        <AddedProjects
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
          />
      </aside>
      <main className="col-span-7 p-4">
        {selectedProjectId ? (<AddedTasks projectId={selectedProjectId} />):
        (<div className='text-center h-full text-base text-muted-foreground content-center'>No project selected. Please select to view Tasks</div>)}
      </main>
    </div>

    <div className='block md:hidden p-4'>
      {selectedProjectId?(
        <AddedTasks projectId={selectedProjectId} />
      ):(
        <div className='text-center h-full text-base text-muted-foreground content-center'>
          Selected a project from the menu to view tasks
        </div>
      )
      }
    </div>
          </div>
  );
}
