'use client';

import {useState} from 'react';
import AddedProjects from '../specific/AddedProjects';
import AddedTasks from '../specific/AddedTasks';

export default function Dashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  return (
    <div className="bg-gray-100 grid grid-cols-10 min-h-screen">
      <aside className="col-span-3 border-r p-4">
        <AddedProjects
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
        />
      </aside>
      <main className="col-span-7 p-4">
        {selectedProjectId ? (<AddedTasks projectId={selectedProjectId} />):(<div className='text-center h-full text-base text-muted-foreground content-center'>No project selected. Please select to view Tasks</div>)}
      </main>
    </div>
  );
}
