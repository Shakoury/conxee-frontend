import * as Primitive from '@radix-ui/react-avatar';
import { cn } from '@/lib/utils';
export function Avatar({
  src,
  name,
  size = 'md',
}: {
  src?: string;
  name: string;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <Primitive.Root
      className={cn(
        'inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-hover ring-2 ring-surface',
        {
          sm: 'size-6 text-label',
          md: 'size-10 text-caption',
          lg: 'size-14 text-h4',
        }[size],
      )}
    >
      <Primitive.Image
        src={src}
        alt={name}
        className="size-full object-cover"
      />
      <Primitive.Fallback delayMs={0}>
        {name
          .split(' ')
          .map((s) => s[0])
          .slice(0, 2)
          .join('')
          .toUpperCase()}
      </Primitive.Fallback>
    </Primitive.Root>
  );
}
export function AvatarGroup({
  users,
}: {
  users: { name: string; src?: string }[];
}) {
  return (
    <div className="flex -space-x-2" aria-label="Group members">
      {users.map((u, i) => (
        <Avatar key={i} {...u} />
      ))}
    </div>
  );
}
