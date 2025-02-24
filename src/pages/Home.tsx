import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, BookOpen, Users, LifeBuoy } from 'lucide-react';

const Home = () => {
  return (
    <div className="space-y-12">
      {/* Hero Section */}
      <section className="text-center py-16 px-4">
        <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-6">
          Your Journey to Mental Wellness
        </h1>
        <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
          Join our supportive community dedicated to mental health awareness, 
          resources, and mutual support.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/register"
            className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition-colors"
          >
            Get Started
          </Link>
          <Link
            to="/resources"
            className="border border-purple-600 text-purple-600 px-8 py-3 rounded-lg hover:bg-purple-50 transition-colors"
          >
            Browse Resources
          </Link>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-12">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                <BookOpen className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Educational Resources</h3>
              <p className="text-gray-600">Access curated mental health resources and expert insights.</p>
            </div>
            <div className="text-center p-6">
              <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Supportive Community</h3>
              <p className="text-gray-600">Connect with others who understand your journey.</p>
            </div>
            <div className="text-center p-6">
              <div className="inline-block p-4 bg-purple-100 rounded-full mb-4">
                <LifeBuoy className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Professional Support</h3>
              <p className="text-gray-600">Get guidance from licensed mental health professionals.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;