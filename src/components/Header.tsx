import { useState } from 'react';
import { Menu, X, Heart } from 'lucide-react';

interface HeaderProps {
  onNavigate: (page: string) => void;
  currentPage: string;
}

export default function Header({ onNavigate, currentPage }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navigation = [
    { name: 'Home', id: 'home' },
    { name: 'About Us', id: 'about' },
    { name: 'Our Impact', id: 'impact' },
    { name: 'Get Involved', id: 'get-involved' },
    { name: 'Volunteer', id: 'volunteers' },
    { name: 'Platform', id: 'platform' },
    { name: 'News', id: 'news' },
    { name: 'Blog', id: 'blog' },
    { name: 'Contact', id: 'contact' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-md">
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          <div
            className="flex items-center cursor-pointer"
            onClick={() => onNavigate('home')}
          >
            <Heart className="h-10 w-10 text-jamaican-green mr-3" />
            <div>
              <div className="text-xl font-heading font-bold text-jamaican-green">JHRF</div>
              <div className="text-xs text-gray-600">Jamaica Hurricane Recovery Fund</div>
            </div>
          </div>

          <div className="hidden md:flex items-center space-x-8">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => onNavigate(item.id)}
                className={`text-sm font-semibold transition-colors ${
                  currentPage === item.id
                    ? 'text-jamaican-green border-b-2 border-jamaican-green pb-1'
                    : 'text-gray-700 hover:text-jamaican-green'
                }`}
              >
                {item.name}
              </button>
            ))}
            <button
              onClick={() => onNavigate('donate')}
              className="btn-primary"
            >
              Donate Now
            </button>
          </div>

          <div className="md:hidden">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700"
            >
              {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden pb-4">
            {navigation.map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  onNavigate(item.id);
                  setMobileMenuOpen(false);
                }}
                className={`block w-full text-left py-2 px-4 ${
                  currentPage === item.id
                    ? 'text-jamaican-green font-semibold bg-primary-50'
                    : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {item.name}
              </button>
            ))}
            <button
              onClick={() => {
                onNavigate('donate');
                setMobileMenuOpen(false);
              }}
              className="btn-primary w-full mt-4"
            >
              Donate Now
            </button>
          </div>
        )}
      </nav>
    </header>
  );
}
