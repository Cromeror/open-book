'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { LogOut } from 'lucide-react';

import { logout } from '@/lib/auth.actions';

interface LogoutButtonProps {
  variant?: 'default' | 'sidebar' | 'sidebar-dark';
  className?: string;
}

/**
 * Logout button that uses the server action to properly clear cookies
 */
export function LogoutButton({ variant = 'default', className = '' }: LogoutButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogout = async () => {
    setIsLoading(true);
    try {
      const result = await logout();
      if (result.success) {
        router.push('/login');
        router.refresh();
      }
    } finally {
      setIsLoading(false);
    }
  };

  if (variant === 'sidebar') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`
          w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
          text-red-600 hover:bg-red-50 transition-colors duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        <LogOut className="h-5 w-5" />
        <span>{isLoading ? 'Cerrando...' : 'Cerrar Sesion'}</span>
      </button>
    );
  }

  if (variant === 'sidebar-dark') {
    return (
      <button
        onClick={handleLogout}
        disabled={isLoading}
        className={`
          w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm
          text-red-400 hover:bg-red-500/10 transition-colors duration-150
          disabled:opacity-50 disabled:cursor-not-allowed
          ${className}
        `}
      >
        <LogOut className="h-5 w-5" />
        <span>{isLoading ? 'Cerrando...' : 'Cerrar Sesion'}</span>
      </button>
    );
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isLoading}
      className={`
        w-full flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50
        disabled:opacity-50 disabled:cursor-not-allowed
        ${className}
      `}
    >
      <LogOut className="h-4 w-4" />
      {isLoading ? 'Cerrando...' : 'Cerrar Sesion'}
    </button>
  );
}
