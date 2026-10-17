import { Outlet } from 'react-router-dom';
import { TopBar } from '@/components/shared/TopBar';
import { Navigation } from '@/components/shared/Navigation';
export default function TabletLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />
      <div className="flex flex-1">
        <aside className="w-20 shrink-0 border-r border-line bg-surface">
          <Navigation mode="tablet" />
        </aside>
        <main id="main-content" className="flex min-w-0 flex-1 flex-col">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
