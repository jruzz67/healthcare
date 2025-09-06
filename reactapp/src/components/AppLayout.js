// src/components/AppLayout.js

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { FiHeart, FiLogOut } from 'react-icons/fi';

const AppHeader = () => {
  const navigate = useNavigate();
  return (
    <header className="bg-white/70 backdrop-blur-lg sticky top-0 z-40 shadow-sm border-b border-gray-200">
      <div className="container mx-auto px-6 py-4 flex justify-between items-center">
        <div 
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => navigate('/')}
        >
          <FiHeart className="text-2xl text-purple-600" />
          <h1 className="text-xl font-bold text-gray-900">HealthSuite</h1>
        </div>
        <button 
          onClick={() => navigate('/')}
          className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg font-semibold hover:bg-gray-300 transition-all flex items-center gap-2"
        >
          <FiLogOut />
          Logout
        </button>
      </div>
    </header>
  );
};

const Footer = () => {
  return (
    <footer className="bg-gray-100 border-t mt-auto py-6">
      <div className="container mx-auto px-6 text-center text-sm text-gray-500">
        &copy; {new Date().getFullYear()} HealthSuite. All Rights Reserved.
      </div>
    </footer>
  );
};


const AppLayout = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50 font-sans text-gray-800">
      <AppHeader />
      <main className="flex-grow container mx-auto p-4 sm:p-6 lg:p-8">
        {children}
      </main>
      <Footer />
    </div>
  );
};

export default AppLayout;
