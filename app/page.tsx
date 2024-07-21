import Image from "next/image";
import Link from "next/link";

export default function Home() {
  return (
    <main className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-10 rounded-lg shadow-md text-center">
        <h1 className="text-4xl font-bold mb-4">Home Page</h1>
        <p className="text-lg mb-8">Welcome to the Home Page!</p>
        <div className="flex space-x-4 justify-center">
          <Link href="/upload">
            <span className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 transition duration-300">
              Go to Upload Page
            </span>
          </Link>
          <Link href="/dashboard">
            <span className="bg-green-500 text-white px-6 py-3 rounded-lg hover:bg-green-600 transition duration-300">
              Go to Dashboard
            </span>
          </Link>
        </div>
      </div>
    </main>
  );
}
