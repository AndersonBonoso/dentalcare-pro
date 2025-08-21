'use client';
import { useState } from 'react';
import { InternalHeader } from '@/components/headers/InternalHeader';
import { SidebarPreview } from '@/components/sidebars/SidebarPreview';

interface DashboardLayoutPreviewProps {
  children: React.ReactNode;
}

export function DashboardLayoutPreview({ children }: DashboardLayoutPreviewProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-teal-500">
      <div className="flex relative">
        {/* Sidebar - Always visible when open */}
        {sidebarOpen && (
          <>
            {/* Overlay for mobile */}
            <div 
              className="fixed inset-0 bg-black bg-opacity-50 z-40"
              onClick={() => setSidebarOpen(false)}
            />
            
            {/* Sidebar */}
            <div className="fixed inset-y-0 left-0 z-50 w-64">
              <SidebarPreview onClose={() => setSidebarOpen(false)} />
            </div>
          </>
        )}
        
        {/* Main Content */}
        <div className="flex-1">
          <InternalHeader 
            onMenuClick={() => setSidebarOpen(!sidebarOpen)}
            sidebarOpen={sidebarOpen}
          />
          <main className="p-6">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}

