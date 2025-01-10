import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';

export function Navbar() {
  const location = useLocation();
  
  return (
    <nav className="bg-white shadow">
      <div className="container mx-auto px-4">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <span className="text-xl font-bold">Dev Community</span>
            </div>
            <div className="ml-6 flex space-x-4 items-center">
              <Link
                to="/profile"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/profile'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Profile
              </Link>
              <Link
                to="/community"
                className={`px-3 py-2 rounded-md text-sm font-medium ${
                  location.pathname === '/community'
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-700 hover:bg-gray-100'
                }`}
              >
                Community
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <button
              onClick={() => supabase.auth.signOut()}
              className="text-gray-700 hover:bg-gray-100 px-3 py-2 rounded-md text-sm font-medium"
            >
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}
