import { useState } from 'react';

function App() {
  const [count, setCount] = useState(0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full text-center">
        <h1 className="text-4xl font-bold text-gray-800 mb-4">To-Do App</h1>
        <p className="text-gray-600 mb-6">Frontend con React + Vite + Tailwind CSS</p>
        
        <div className="space-y-4">
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-2xl font-bold text-blue-600">{count}</p>
            <p className="text-sm text-gray-600">Contador de prueba</p>
          </div>
          
          <button
            onClick={() => setCount(count + 1)}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-semibold py-3 px-6 rounded-lg transition-colors"
          >
            Incrementar
          </button>
        </div>
        
        <div className="mt-6 pt-6 border-t border-gray-200">
          <p className="text-sm text-green-600 font-semibold">
            ✓ React funcionando correctamente
          </p>
        </div>
      </div>
    </div>
  );
}

export default App;