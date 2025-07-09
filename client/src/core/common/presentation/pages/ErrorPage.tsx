import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom';

export default function ErrorPage() {
  const error = useRouteError();

  let errorMessage: string;
  let status: number;

  if (isRouteErrorResponse(error)) {
    status = error.status;
    errorMessage = error.data?.message || error.statusText;
  } else if (error instanceof Error) {
    status = 500;
    errorMessage = error.message;
  } else {
    status = 500;
    errorMessage = 'An unexpected error occurred';
  }

  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-900">{status}</h1>
        <p className="text-lg text-gray-600">{errorMessage}</p>
        <Link
          to="/"
          className="inline-block px-4 py-2 rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
        >
          Back to Home
        </Link>
      </div>
    </div>
  );
}
