import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Heart, Menu, X, LogOut, Camera, Users, BookOpen, MessageSquare, LifeBuoy, Shield } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { supabase } from '../../utils/supabase';

interface Profile {
  full_name: string;
  role: string;
}

const Navbar = () => {
  const [isOpen, setIsOpen] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isScrolled, setIsScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const getProfile = async () => {
      if (user?.id) {
        const { data, error } = await supabase
          .from('profiles')
          .select('full_name, role')
          .eq('id', user.id)
          .single();
        
        if (!error && data) {
          setProfile(data);
        }
      }
    };

    getProfile();
  }, [user?.id]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const menu = document.getElementById('mobile-menu');
      const button = document.getElementById('menu-button');
      if (isOpen && menu && !menu.contains(event.target as Node) && !button?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Error logging out:', error);
    }
  };

  return (
    <nav className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      isScrolled ? 'bg-white/95 backdrop-blur-sm shadow-md' : 'bg-white shadow-lg'
    }`}>
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center">
              <Heart className="h-8 w-8 text-purple-600" />
              <span className="ml-2 text-xl font-bold text-gray-800">MindfulSpace</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="flex items-center space-x-4">
            {user && profile && (
              <>
                {/* Welcome message - visible only on desktop */}
                <span className="hidden md:block text-purple-700 font-medium">
                  Welcome, {profile.full_name}
                </span>
                {profile.role === 'admin' && (
                  <Link
                    to="/admin"
                    className="flex items-center text-purple-600 hover:text-purple-700"
                  >
                    <Shield className="h-5 w-5 mr-1" />
                    Admin
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="flex items-center text-purple-600 hover:text-purple-700"
                >
                  <LogOut className="h-5 w-5 mr-1" />
                  Logout
                </button>
              </>
            )}
            <button
              id="menu-button"
              onClick={() => setIsOpen(!isOpen)}
              className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
              aria-expanded={isOpen}
            >
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Navigation Overlay */}
      <div 
        className={`fixed inset-0 bg-black bg-opacity-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        aria-hidden="true"
      />

      {/* Navigation Menu */}
      <div
        id="mobile-menu"
        className={`fixed top-0 right-0 h-full w-64 bg-white shadow-xl transform transition-transform duration-300 ease-in-out ${
          isOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Welcome Message in Menu - visible only on mobile */}
          {user && profile && (
            <div className="p-4 bg-purple-50 md:hidden">
              <span className="text-purple-700 font-medium">Welcome, {profile.full_name}</span>
            </div>
          )}
          <div className="flex justify-end p-4">
            <button
              onClick={() => setIsOpen(false)}
              className="rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 p-2"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <div className="px-4 py-2 space-y-4">
            <Link 
              to="/resources" 
              className="flex items-center text-gray-600 hover:text-purple-600"
              onClick={() => setIsOpen(false)}
            >
              <BookOpen className="h-5 w-5 mr-2" />
              Resources
            </Link>
            <Link 
              to="/forum" 
              className="flex items-center text-gray-600 hover:text-purple-600"
              onClick={() => setIsOpen(false)}
            >
              <MessageSquare className="h-5 w-5 mr-2" />
              Community
            </Link>
            <Link 
              to="/support" 
              className="flex items-center text-gray-600 hover:text-purple-600"
              onClick={() => setIsOpen(false)}
            >
              <LifeBuoy className="h-5 w-5 mr-2" />
              Support
            </Link>
            <Link 
              to="/support/groups" 
              className="flex items-center text-gray-600 hover:text-purple-600"
              onClick={() => setIsOpen(false)}
            >
              <Users className="h-5 w-5 mr-2" />
              Support Groups
            </Link>
            <Link 
              to="/mood" 
              className="flex items-center text-gray-600 hover:text-purple-600"
              onClick={() => setIsOpen(false)}
            >
              <Camera className="h-5 w-5 mr-2" />
              Mood Check
            </Link>
            
            {!user && (
              <>
                <Link 
                  to="/login" 
                  className="block text-purple-600 hover:text-purple-700"
                  onClick={() => setIsOpen(false)}
                >
                  Login
                </Link>
                <Link 
                  to="/register" 
                  className="block bg-purple-600 text-white px-4 py-2 rounded-md hover:bg-purple-700"
                  onClick={() => setIsOpen(false)}
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;