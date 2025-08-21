'use client';
import Image from 'next/image';
import { ExternalHeader } from '@/components/headers/ExternalHeader';

interface AuthLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export function AuthLayout({ children, title }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-600 via-blue-700 to-teal-500">
      <ExternalHeader />
      
      <div className="flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            {/* Logo and Title */}
            <div className="flex items-center justify-center mb-8">
              <Image
                src="/assets/logo-dente.png"
                alt="DentalCare Pro"
                width={64}
                height={64}
                className="rounded-full mr-3"
              />
              <div className="text-left">
                <h1 
                  className="text-2xl font-bold"
                  style={{
                    background: 'linear-gradient(to right, #1e40af, #0f766e)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    backgroundClip: 'text'
                  }}
                >
                  DentalCare Pro
                </h1>
                {title && <p className="text-gray-600 text-sm">{title}</p>}
              </div>
            </div>

            {/* Content */}
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}

