export function Footer() {
  return (
    <footer className="bg-light-800 dark:bg-dark-800 shadow-sm mt-auto">
      <div className="container mx-auto px-4 py-4">
        <p className="text-center text-sm text-gray-600 dark:text-gray-500">
          © {new Date().getFullYear()} Coderplex. All rights reserved.
        </p>
      </div>
    </footer>
  );
} 