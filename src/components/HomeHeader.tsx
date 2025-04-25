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
import {auth} from '../../firebaseConfig';
import {useRouter} from 'next/navigation';

export default function DashboardHeader() {
  const router = useRouter();
  const [displayName, setDisplayName] = useState('');

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
      await signOut(auth); // Firebase logout
      document.cookie =
        'authToken=; path=/; expires=Thu, 01 Jan 1970 00:00:01 GMT'; // Clear cookie
      router.push('/'); // Redirect to login or home
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };
  return (
    <header className="flex items-center justify-between px-6 py-4 shadow-sm bg-white">
      <Sheet>
        <SheetTrigger className="md:hidden" asChild>
          <Button variant="ghost" size="icon">
            ☰
          </Button>
        </SheetTrigger>
        <SheetContent side="left"></SheetContent>
      </Sheet>

      <div>
        <h1 className="text-xl font-bold">Hello {displayName}</h1>
      </div>

      <div className="flex items-center space-x-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="cursor-pointer">
              <AvatarImage src="../../assets/images/profile.png" alt="@user" />
              <AvatarFallback>U</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
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
