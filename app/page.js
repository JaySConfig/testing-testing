// app/page.js
export default function Home() {
  return (
    <main className="min-h-screen p-8 bg-gray-50">
      <div className="max-w-4xl mx-auto">
        <header className="mb-12 text-center">
          <h1 className="text-4xl font-bold mb-4 text-gray-900">Prototype Testing Ground</h1>
          <p className="text-gray-600 max-w-lg mx-auto">
            A collection of prototypes and concept tests for various ideas and features.
          </p>
        </header>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <a 
            href="/linkedin-strategy" 
            className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
          >
            <h2 className="text-xl font-semibold mb-2 text-emerald-600">LinkedIn Strategy Generator</h2>
            <p className="text-gray-600">Create a personalized LinkedIn content strategy based on your goals and expertise.</p>
            <div className="mt-4 text-sm font-medium text-emerald-600">Try it →</div>
          </a>

          {/* You can add more prototype cards here as you build them */}
          <div className="block p-6 bg-white rounded-lg shadow-md border-dashed border-2 border-gray-200 flex items-center justify-center">
            <p className="text-gray-400 text-center">More prototypes coming soon...</p>
          </div>
        </div>
      </div>
    </main>
  );
}