import Link from "next/link";
// import Auth from "./Auth";

export default function Navbar() {
  return (
    <nav className="bg-blue-600 p-4 text-white flex justify-between">
      <div className="invisible">Hello..</div>
      <h1 className="text-lg font-semibold">Log Dashboard</h1>
      <div className="flex flex-col items-center justify-center ">
        <Link href="/" className="px-4 hover:underline">
          Upload
        </Link>
        <Link href="/logs" className="px-4 hover:underline">
          Logs
        </Link>
        {/* <Auth /> */}
      </div>
    </nav>
  );
}
