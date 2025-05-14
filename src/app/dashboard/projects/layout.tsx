// dashboard/projects/layout.tsx
'use client';

import { ReactNode } from 'react';
import AddedProjects from '@/components/specific/AddedProjects';
import DashboardHeader from '@/components/common/HomeHeader';

export default function ProjectsLayout({ children }: { children: ReactNode }) {
    return (
    <div>
      <DashboardHeader />        
    <div className="bg-gray-100 min-h-screen">
      <div className="hidden md:grid grid-cols-10 min-h-screen">
        {/* 30% Project List */}
        <aside className="col-span-3 border-r p-4">
          <AddedProjects />
        </aside>

        {/* 70% Main Content (e.g., AddedTasks for projectId) */}
        <main className="col-span-7 p-4">
          {children}
        </main>
      </div>

      {/* Mobile fallback (no split) */}
      <div className="block md:hidden p-4">
        {children}
      </div>
    </div>
    </div>
  );
}
