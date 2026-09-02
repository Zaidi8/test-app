// dashboard/projects/layout.tsx
'use client';

import {ReactNode} from 'react';
import ProjectList from '@/components/specific/ProjectList';
import DashboardHeader from '@/components/common/HomeHeader';
import SocketProvider from '@/providers/SocketProvider';
import MembersPanel from '@/components/specific/MembersPanel';
import ActivityFeed from '@/components/specific/ActivityFeed';
import {useWorkspaces} from '@/services/workspaces';

export default function ProjectsLayout({children}: {children: ReactNode}) {
  const {data: workspaces} = useWorkspaces();
  const workspaceId = workspaces?.[0]?.id ?? '';

  return (
    <SocketProvider workspaceId={workspaceId}>
      <div>
        <DashboardHeader />
        <div className="bg-gray-100 min-h-screen">
          <div className="hidden md:grid grid-cols-10 min-h-screen">
            <aside className="col-span-3 border-r p-4">
              <ProjectList workspaceId={workspaceId} />

              <div className="mt-6 border-t pt-4">
                <MembersPanel workspaceId={workspaceId} />
              </div>

              <div className="mt-6 border-t pt-4">
                <ActivityFeed workspaceId={workspaceId} />
              </div>
            </aside>

            <main className="col-span-7 pb-16 p-4">{children}</main>
          </div>

          <div className="block md:hidden p-4">{children}</div>
        </div>
      </div>
    </SocketProvider>
  );
}
