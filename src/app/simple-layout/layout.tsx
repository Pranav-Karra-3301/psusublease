'use client';

import Link from 'next/link';

export default function SimpleLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex flex-col">
      <header className="bg-white shadow-sm border-b p-4 flex justify-between items-center">
        <div className="font-bold text-xl">
          <Link href="/">PSU Subleases</Link>
        </div>
        <nav>
          <ul className="flex space-x-4">
            <li>
              <Link href="/auth/signin" className="text-blue-600 hover:underline">
                Sign In
              </Link>
            </li>
            <li>
              <Link href="/auth/signup" className="text-blue-600 hover:underline">
                Sign Up
              </Link>
            </li>
          </ul>
        </nav>
      </header>
      
      <main className="flex-grow">
        {children}
      </main>
      
      <footer className="bg-gray-100 p-4 text-center text-gray-500">
        <p>© 2023 PSU Subleases</p>
      </footer>
    </div>
  );
} 