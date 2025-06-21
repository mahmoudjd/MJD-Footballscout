import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] px-6 py-12">
      <div className="text-center">
        <h2 className="text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
          Players Not Found
        </h2>
        <p className="mt-4 text-base text-gray-500">
          Sorry, we couldn't find the players you're looking for.
        </p>
        <div className="mt-10">
          <Link 
            href="/"
            className="rounded-md bg-cyan-700 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-cyan-600 focus:outline-none focus:ring-2 focus:ring-cyan-500"
          >
            Go back home
          </Link>
        </div>
      </div>
    </div>
  );
}