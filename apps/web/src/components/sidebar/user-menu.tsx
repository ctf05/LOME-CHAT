import * as React from 'react';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  cn,
} from '@lome-chat/ui';
import { LogOut, Settings, User } from 'lucide-react';
import { useUIStore } from '@/stores/ui';
import { signOutAndClearCache } from '@/lib/auth';

interface UserMenuUser {
  name: string;
  email: string;
  image: string | null;
}

interface UserMenuProps {
  user: UserMenuUser;
  onProfileClick?: () => void;
  onSettingsClick?: () => void;
}

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((part) => part[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

export function UserMenu({
  user,
  onProfileClick,
  onSettingsClick,
}: UserMenuProps): React.JSX.Element {
  const sidebarOpen = useUIStore((state) => state.sidebarOpen);

  const handleSignOut = async (): Promise<void> => {
    await signOutAndClearCache();
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-testid="user-menu-trigger"
        aria-label="User menu"
        className={cn(
          'flex w-full items-center gap-2 rounded-md p-2 text-sm',
          'hover:bg-sidebar-border/50 transition-colors',
          'focus-visible:ring-ring focus:outline-none focus-visible:ring-2',
          !sidebarOpen && 'justify-center'
        )}
      >
        <Avatar data-testid="user-avatar" className="h-8 w-8">
          {user.image && <AvatarImage src={user.image} alt={user.name} />}
          <AvatarFallback className="bg-primary text-primary-foreground text-xs">
            {getInitials(user.name)}
          </AvatarFallback>
        </Avatar>
        {sidebarOpen && <span className="truncate">{user.name}</span>}
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-56">
        <div className="px-2 py-1.5">
          <p className="text-sm font-medium">{user.name}</p>
          <p className="text-muted-foreground text-xs">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onProfileClick}>
          <User className="mr-2 h-4 w-4" aria-hidden="true" />
          Profile
        </DropdownMenuItem>
        <DropdownMenuItem onClick={onSettingsClick}>
          <Settings className="mr-2 h-4 w-4" aria-hidden="true" />
          Settings
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() => void handleSignOut()}
          className="text-destructive focus:text-destructive"
        >
          <LogOut className="mr-2 h-4 w-4" aria-hidden="true" />
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
