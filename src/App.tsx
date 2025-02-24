import React from 'react';
import { BrowserRouter as Router } from 'react-router-dom';
import { Heart } from 'lucide-react';
import AppRoutes from './routes';
import Navbar from './components/layout/Navbar';
import Footer from './components/layout/Footer';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-gray-50 flex flex-col">
        <Navbar />
        <main className="flex-grow container mx-auto px-4 py-8 mt-16">
          <AppRoutes />
        </main>
        <Footer />
      </div>
    </Router>
  );
}

export default App;