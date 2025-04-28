'use client';

import {useState} from 'react';
import AddedProjects from '../specific/AddedProjects';
import AddedTasks from '../specific/AddedTasks';

export default function Dashboard() {
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(
    null,
  );

  return (
    <div className="grid grid-cols-10 h-screen">
      <aside className="col-span-3 border-r p-4">
        <AddedProjects
          selectedProjectId={selectedProjectId}
          setSelectedProjectId={setSelectedProjectId}
        />
      </aside>
      <main className="col-span-7 p-4">
        {selectedProjectId && <AddedTasks projectId={selectedProjectId} />}
      </main>
    </div>
  );
}
