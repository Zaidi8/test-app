'use client';
import {useState} from 'react';

import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Sheet, SheetTrigger, SheetContent} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {Button} from '@/components/ui/button';
import {useRouter} from 'next/navigation';
import AddedProjects from '../specific/AddedProjects';
import {useAuth} from '@/lib/auth-provider';

export default function DashboardHeader() {
  const router = useRouter();
  const {user, logout} = useAuth();
  const [open, setOpen] = useState(false);
  const displayName = user?.name ?? '';

  const handleLogout = async () => {
    try {
      await logout();
    } finally {
      router.push('/auth/login');
    }
  };
  return (
    <header className="flex items-center justify-between px-6 py-4 shadow-sm bg-white">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger className="md:hidden" asChild>
          <Button variant="ghost" size="icon">
            ☰
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="pt-4">
          <AddedProjects onProjectSelect={() => setOpen(false)} />
        </SheetContent>
      </Sheet>
      <div>
        <h1 className="text-xl font-bold truncate max-w-[150px] sm:max-w-none">
          {displayName ? `Hello ${displayName}` : 'Welcome to Prioritree'}
        </h1>
      </div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src={user?.avatarUrl ?? '/profile.png'} alt="@user" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="mix-w-[150px]">
            <DropdownMenuItem className="cursor-pointer">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Settings
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="cursor-pointer">
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
