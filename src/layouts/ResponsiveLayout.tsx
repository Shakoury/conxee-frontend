import { useSyncExternalStore } from 'react';
import MobileLayout from './MobileLayout';
import TabletLayout from './TabletLayout';
import DesktopLayout from './DesktopLayout';
const subscribe = (callback: () => void) => {
  window.addEventListener('resize', callback);
  return () => window.removeEventListener('resize', callback);
};
export default function ResponsiveLayout() {
  const width = useSyncExternalStore(
    subscribe,
    () => window.innerWidth,
    () => 375,
  );
  return width < 768 ? (
    <MobileLayout />
  ) : width <= 1024 ? (
    <TabletLayout />
  ) : (
    <DesktopLayout />
  );
}
