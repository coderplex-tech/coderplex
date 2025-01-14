import { SunIcon, MoonIcon } from '@heroicons/react/24/outline';
import { useTheme } from '../context/ThemeContext';
import { Button } from './ui/Button';

export function LandingPage() {
  const { theme, toggleTheme } = useTheme();
  
  return (
    <div className="min-h-screen relative">
      <div className="container mx-auto px-4 relative z-10">
        {/* Navigation */}
        <nav className="flex items-center justify-between py-6">
          <div className="text-xl md:text-2xl font-bold text-gray-800 dark:text-gray-100">
            <span className="inline-block">
              coderplexDev
            </span>
            <span className="inline-block">
              <span className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors duration-700">
                Community
              </span>
              ()
            </span>
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
        <div className="flex flex-col items-center justify-center min-h-[80vh] text-center max-w-4xl mx-auto">
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-12 font-mono">
            A dedicated space for developers and other tech workers in our community to connect with each other.
          </p>
          
          <p className="text-lg md:text-xl text-gray-600 dark:text-gray-300 leading-relaxed mb-12 font-mono">
            Discover the talent in our community.
          </p>

          {/* Call to Action Buttons */}
          <div className="flex flex-wrap justify-center gap-4">
            <Button
              to="/login?auth-view=sign_up"
              variant="primary"
              size="lg"
              className="hover:scale-105 transition-transform duration-300"
            >
              Join Now →
            </Button>
            <Button
              to="/login?auth-view=sign_in"
              variant="ghost"
              size="lg"
              className="border border-gray-200 dark:border-gray-700 hover:scale-105 transition-transform duration-300"
            >
              Sign In
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
} 