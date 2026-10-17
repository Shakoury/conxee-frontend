import { Link, useNavigate } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useState, type FormEvent } from 'react';
import { Logo } from './Logo';
import { Avatar } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { SearchInput } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
export function TopBar({ mobile = false }: { mobile?: boolean }) {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const navigate = useNavigate();
  function submit(e: FormEvent) {
    e.preventDefault();
    navigate(`/explore?q=${encodeURIComponent(search)}`);
  }
  return (
    <header className="flex h-20 shrink-0 items-center justify-between gap-6 border-b border-line bg-surface px-5 md:px-8">
      <Link to="/" aria-label="Conxee home">
        <Logo />
      </Link>
      {!mobile && (
        <form
          onSubmit={submit}
          role="search"
          className="mx-auto w-full max-w-md"
        >
          <SearchInput
            placeholder="Search Conxee"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </form>
      )}
      <div className="flex items-center gap-2 md:gap-4">
        <Button asChild variant="icon">
          <Link to="/notifications" aria-label="Notifications">
            <Bell className="size-5" />
          </Link>
        </Button>
        <Link
          to="/profile"
          className="flex min-h-11 min-w-11 items-center justify-center"
          aria-label="Your profile"
        >
          <Avatar
            name={user?.display_name || user?.username || 'User'}
            src={user?.avatarUrl}
          />
        </Link>
      </div>
    </header>
  );
}
