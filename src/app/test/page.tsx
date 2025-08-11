"use client";

export default function TestPage() {
  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-black mb-4">Test Page</h1>
        <p className="text-gray-600">
          If you can see this, Next.js is working!
        </p>
        <p className="text-sm text-gray-400 mt-2">
          Now go back to localhost:3000 and check the console for errors
        </p>
      </div>
    </div>
  );
}
