import { Link } from 'react-router-dom';

export default function Unauthorized() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 text-center">
      <div>
        <h1 className="text-3xl font-bold mb-4">Access Denied</h1>
        <p className="mb-6 text-gray-600">
          You don't have permission to view this page.
        </p>
        <Link to="/" className="underline">Go back home</Link>
      </div>
    </div>
  );
}