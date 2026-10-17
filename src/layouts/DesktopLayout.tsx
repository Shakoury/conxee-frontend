import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { TopBar } from '@/components/shared/TopBar';
import { Navigation } from '@/components/shared/Navigation';
export default function DesktopLayout({
  rightPanel,
}: {
  rightPanel?: ReactNode;
}) {
  return (
    <div className="flex min-h-dvh flex-col">
      <TopBar />
      <div className="flex flex-1">
        <aside className="w-60 shrink-0 border-r border-line bg-surface">
          <Navigation mode="desktop" />
        </aside>
        <main id="main-content" className="flex min-w-0 flex-1 flex-col">
          <Outlet />
        </main>
        {rightPanel && (
          <aside
            aria-label="Suggestions and notifications"
            className="w-72 border-l border-line p-6"
          >
            {rightPanel}
          </aside>
        )}
      </div>
    </div>
  );
}
