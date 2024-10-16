// app/dashboard/layout.tsx
import React from 'react';
import { Toolbar } from './DashTool';

// DashboardLayout component
export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-[#212121]">
      <main className="p-8">
        {children}
      </main>
      <Toolbar />
    </div>
  );
}
