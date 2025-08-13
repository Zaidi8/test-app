'use client';
import {signOut, onAuthStateChanged} from 'firebase/auth';
import {useEffect, useState} from 'react';

import {Avatar, AvatarFallback, AvatarImage} from '@/components/ui/avatar';
import {Sheet, SheetTrigger, SheetContent} from '@/components/ui/sheet';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/ui/dropdown-menu';
import {Button} from '@/components/ui/button';
import {auth} from '../../../firebaseConfig';
import {useRouter} from 'next/navigation';
import AddedProjects from '../specific/AddedProjects';
import {FeatureEnabled} from '../FeatureEnabled';

export default function DashboardHeader() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');
  const [open, setOpen] = useState(false);
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, user => {
      if (user) {
        setDisplayName(user.displayName || 'User');
      } else {
        setDisplayName('');
      }
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      // Clear the auth token cookie first
      document.cookie = 'authToken=; path=/; max-age=0';

      // Sign out from Firebase
      await signOut(auth);

      // Small delay to ensure cleanup completes
      await new Promise(resolve => setTimeout(resolve, 100));

      // Navigate to login page
      router.push('/auth/login');
    } catch (error) {
      console.error('Error logging out:', error);
      // Even if there's an error, try to navigate to login
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
        <FeatureEnabled
          featureFlag="MULTIPLE_ALLOWANCES"
          fallback={
            <h1 className="text-xl font-bold truncate max-w-[150px] sm:max-w-none">
              Hello! Welcome to Prioritree.
            </h1>
          }>
          <h1 className="text-xl font-bold truncate max-w-[150px] sm:max-w-none">
            Hello {displayName}
          </h1>
        </FeatureEnabled>
      </div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src="/profile.png" alt="@user" />
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
