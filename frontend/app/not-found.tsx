import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="bg-page flex min-h-screen items-center justify-center p-4">
      <div className="text-center">
        <p className="font-heading text-foreground mb-2 text-7xl font-bold opacity-10">404</p>
        <h2 className="text-foreground mb-2 text-xl font-bold">Page not found</h2>
        <p className="text-muted-foreground mb-6 text-sm">
          The page you&apos;re looking for doesn&apos;t exist.
        </p>
        <Link
          href="/dashboard"
          className="inline-block rounded-xl bg-indigo-600 px-6 py-2.5 text-sm font-medium text-white transition-colors hover:bg-indigo-700"
        >
          Go to Dashboard
        </Link>
      </div>
    </div>
  );
}
