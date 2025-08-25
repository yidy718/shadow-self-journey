export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-purple-900/20 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-4">404</h1>
        <p className="text-gray-300 mb-6">This path leads nowhere in the abyss</p>
        <a href="/" className="text-purple-400 hover:text-purple-300 transition-colors">
          Return to the beginning
        </a>
      </div>
    </div>
  );
}