import { Outlet } from 'react-router-dom';
import { TopBar } from '@/components/shared/TopBar';
import { Navigation } from '@/components/shared/Navigation';
export default function MobileLayout() {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar mobile />
      <main
        id="main-content"
        className="flex flex-1 flex-col pb-[calc(80px+env(safe-area-inset-bottom))]"
      >
        <Outlet />
      </main>
      <Navigation mode="mobile" />
    </div>
  );
}
