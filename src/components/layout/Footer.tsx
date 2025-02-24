import React from 'react';
import { Heart, Mail, Phone } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-gray-800 text-white">
      <div className="max-w-7xl mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center">
              <Heart className="h-6 w-6 text-purple-400" />
              <span className="ml-2 text-xl font-bold">MindfulSpace</span>
            </div>
            <p className="mt-2 text-gray-400">
              Supporting mental health and wellness through community and resources.
            </p>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              <li><a href="/about" className="text-gray-400 hover:text-white">About Us</a></li>
              <li><a href="/resources" className="text-gray-400 hover:text-white">Resources</a></li>
              <li><a href="/forum" className="text-gray-400 hover:text-white">Community Forum</a></li>
              <li><a href="/support" className="text-gray-400 hover:text-white">Get Support</a></li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Contact</h3>
            <ul className="space-y-2">
              <li className="flex items-center">
                <Mail className="h-5 w-5 mr-2 text-purple-400" />
                <a href="mailto:support@mindfulspace.com" className="text-gray-400 hover:text-white">
                  support@mindfulspace.com
                </a>
              </li>
              <li className="flex items-center">
                <Phone className="h-5 w-5 mr-2 text-purple-400" />
                <span className="text-gray-400">1-800-MINDFUL</span>
              </li>
            </ul>
          </div>
          
          <div>
            <h3 className="text-lg font-semibold mb-4">Emergency</h3>
            <p className="text-gray-400">
              If you're experiencing a mental health emergency, please call:
            </p>
            <p className="text-white font-bold mt-2">988</p>
            <p className="text-gray-400 mt-2">
              Suicide & Crisis Lifeline
              Available 24/7
            </p>
          </div>
        </div>
        
        <div className="mt-8 pt-8 border-t border-gray-700 text-center text-gray-400">
          <p>&copy; {new Date().getFullYear()} MindfulSpace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;