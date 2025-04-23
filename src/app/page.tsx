// src/app/page.tsx
import { redirect } from 'next/navigation';

export default function Home() {
  redirect('/auth/login'); // like setting initial route to Login screen
}
