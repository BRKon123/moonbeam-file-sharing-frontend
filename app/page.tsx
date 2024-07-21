"use client";

import { useState } from 'react';
import Link from 'next/link';
import AdminMenu from './components/AdminMenu';

export default function Home() {
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  const toggleAdminMenu = () => {
    setIsAdminMenuOpen(!isAdminMenuOpen);
  };

  return (
    <main className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold mb-4">Home Page</h1>
        <p className="text-lg mb-8">Welcome to the Home Page!</p>
        <div className="flex space-x-4 justify-center mb-8">
          <Link href="/upload">
            <span className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300">
              Go to Upload Page
            </span>
          </Link>
          <Link href="/dashboard">
            <span className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-300">
              Go to Dashboard
            </span>
          </Link>
        </div>
        <button
          onClick={toggleAdminMenu}
          className="bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg hover:bg-blue-600 transition duration-300"
        >
          Admin
        </button>
      </div>
      {isAdminMenuOpen && <AdminMenu onClose={toggleAdminMenu} />}
    </main>
  );
}
