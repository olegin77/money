export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <div className="text-center">
        <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-indigo-500 via-purple-500 to-purple-400 bg-clip-text text-transparent">
          FinTrack Pro
        </h1>
        <p className="text-xl text-gray-600 dark:text-gray-400 mb-8">
          Data Serenity • Modern Finance Management
        </p>
        <div className="flex gap-4 justify-center">
          <button className="px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-2xl font-semibold hover:opacity-90 transition-opacity">
            Get Started
          </button>
          <button className="px-6 py-3 border border-gray-300 dark:border-gray-700 rounded-2xl font-semibold hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
            Learn More
          </button>
        </div>
      </div>
    </main>
  );
}
