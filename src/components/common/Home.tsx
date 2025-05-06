import DashboardHeader from '@/components/common/HomeHeader';
import Dashboard from './Dashboard';

export default function HomePage() {
  return (
    <div className="min-h-screen flex flex-col">
      <DashboardHeader />
      <Dashboard />
    </div>
  );
}
