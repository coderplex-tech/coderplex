import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import { TypewriterText } from './TypewriterText';
import { Button } from './ui/Button';

export function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between py-6">
          <div className="text-2xl font-bold text-gray-800 dark:text-gray-100">
            coderplex
          </div>
          <div className="flex items-center space-x-4">
            <Button
              onClick={toggleTheme}
              variant="secondary"
              size="sm"
              className="aspect-square"
            >
              {theme === 'dark' ? (
                <SunIcon className="w-4 h-4" />
              ) : (
                <MoonIcon className="w-4 h-4" />
              )}
            </Button>
          </div>
        </nav>

        {/* Hero Section */}
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-800 dark:text-gray-100 mb-12">
            <TypewriterText 
              phrases={['coderplexDevCommunity()']}
              typingSpeed={150}
              deletingSpeed={100}
              pauseDuration={3000}
            />
          </h1>
          <Button
            to="/login"
            variant="primary"
            size="lg"
            className="hover:scale-105 transition-transform duration-300"
          >
            Login →
          </Button>
        </div>
      </div>
    </div>
  );
} 