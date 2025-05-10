const footer = () => {
  return (
    <footer className="mt-auto bg-gray-50 border-t border-gray-100 py-12">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-center">
          <div className="mb-6 md:mb-0">
            <p className="flex items-center text-gray-800 font-medium">
              <span className="text-indigo-600 mr-2 text-xl">●</span>
              AskAround
            </p>
            <p className="text-gray-500 text-sm mt-1">
              Share your thoughts, shape our future
            </p>
          </div>
          <div className="text-gray-500 text-sm">
            © {new Date().getFullYear()} AskAround Survey Platform
          </div>
        </div>
      </div>
    </footer>
  );
};

export default footer;
