import { NextResponse } from 'next/server';

export async function GET() {
  const res = await fetch('https://app.beeceptor.com/console/cac5c0e41dd146720309');
  const data = await res.json();
  return NextResponse.json(data);
}
