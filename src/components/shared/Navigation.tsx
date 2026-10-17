import { NavLink } from 'react-router-dom';
import {
  House,
  Users,
  Play,
  Store,
  UserRound,
  Compass,
  CalendarDays,
  BookOpen,
  FolderOpen,
  MessageCircle,
  Settings,
} from 'lucide-react';
import { cn } from '@/lib/utils';
export const mainLinks = [
  { to: '/', label: 'Home', icon: House },
  { to: '/communities', label: 'Communities', icon: Users },
  { to: '/watch', label: 'Watch', icon: Play },
  { to: '/marketplace', label: 'Marketplace', icon: Store },
  { to: '/profile', label: 'Profile', icon: UserRound },
];
const extraLinks = [
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/events', label: 'Events', icon: CalendarDays },
  { to: '/tutorials', label: 'Tutorials', icon: BookOpen },
  { to: '/resources', label: 'Resources', icon: FolderOpen },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/settings', label: 'Settings', icon: Settings },
];
export function Navigation({
  mode,
}: {
  mode: 'mobile' | 'tablet' | 'desktop';
}) {
  const mobile = mode === 'mobile';
  return (
    <nav
      aria-label="Main navigation"
      className={cn(
        mobile
          ? 'safe-bottom fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-line bg-surface'
          : 'flex h-full flex-col gap-1 p-3',
      )}
    >
      {(mobile ? mainLinks : [...mainLinks, ...extraLinks]).map(
        ({ to, label, icon: Icon }, index) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/' || to === '/profile'}
            aria-label={label}
            title={mode === 'tablet' ? label : undefined}
            className={({ isActive }) =>
              cn(
                'flex min-h-11 items-center rounded-lg text-muted transition-colors hover:bg-hover hover:text-foreground',
                mobile
                  ? 'flex-col justify-center gap-1 px-1 py-3 text-[10px]'
                  : mode === 'tablet'
                    ? 'justify-center p-3'
                    : 'gap-3 px-3 py-3 text-caption',
                isActive && 'bg-hover font-semibold text-foreground',
                !mobile && index === 5 && 'mt-6',
              )
            }
          >
            <Icon className="size-5 shrink-0" />
            {mode !== 'tablet' && <span>{label}</span>}
          </NavLink>
        ),
      )}
    </nav>
  );
}
