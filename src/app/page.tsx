import Link from "next/link";

export default function Home() {
  return (
    <main className="flex flex-col items-center justify-center min-h-screen gap-4">
      <h1 className="text-3xl font-bold">MediTrack</h1>
      <p>Track medications easily</p>

      <div className="flex gap-4">
        <Link href="/login" className="px-4 py-2 bg-blue-500 text-white rounded">
          Login
        </Link>

        <Link href="/register" className="px-4 py-2 bg-green-500 text-white rounded">
          Register
        </Link>
      </div>
    </main>
  );
}