import Link from "next/link";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between">
      <h1 className="text-lg font-semibold">Log Dashboard</h1>
      <div>
        <Link href="/" className="px-4 hover:underline">
          Upload
        </Link>
        <Link href="/logs" className="px-4 hover:underline">
          Logs
        </Link>
      </div>
    </nav>
  );
}
