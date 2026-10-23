import Link from 'next/link';

export default function NotFound() {
  return (
    <div className="container mx-auto px-4 py-32 text-center max-w-lg min-h-[60vh] flex flex-col justify-center items-center">
      <h1 className="text-4xl font-bold mb-4 uppercase tracking-wider text-vini-black">Page Not Found</h1>
      <p className="text-muted-foreground mb-8 text-lg">
        The page you are looking for does not exist or has been moved.
      </p>
      <Link href="/" className="btn btn-primary h-12 px-8 uppercase tracking-widest font-semibold">
        Return Home
      </Link>
    </div>
  );
}
