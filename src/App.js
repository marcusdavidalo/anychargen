import React, { useState, useRef, useEffect } from "react";
import Worker from "worker-loader!./combinations.worker";
import logo from "./logo.png";

function App() {
  const [input, setInput] = useState("");
  const [length, setLength] = useState(0);
  const [combinations, setCombinations] = useState([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const workerRef = useRef(null);

  useEffect(() => {
    workerRef.current = new Worker();

    workerRef.current.addEventListener("message", (event) => {
      const newCombinations = event.data;
      setCombinations((combinations) =>
        [...combinations, ...newCombinations].sort()
      );
      setLoading(false);
    });

    return () => {
      workerRef.current.terminate();
    };
  }, []);

  const handleInputChange = (value) => {
    // Check for repeating characters in real-time
    const uniqueCharacters = [...new Set(value)];
    if (uniqueCharacters.length !== value.length) {
      setError("Warning: Repeating characters detected!");
    } else {
      setError("");
    }
    setInput(value);
  };

  const generateCombinations = () => {
    if (!input || !length || isNaN(length) || length <= 0) {
      setError(
        "Invalid input or length. Please enter a string and a positive integer."
      );
      return;
    }

    setError("");
    setLoading(true);
    setCombinations([]);
    const inputArray = input.split("");
    workerRef.current.postMessage({ inputArray, length: parseInt(length, 10) });
  };

  const downloadCombinations = () => {
    const content = combinations.join("\n");
    const blob = new Blob([content], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "combinations.txt";
    a.click();
  };

  return (
    <div className="bg-slate-900 text-white flex items-center justify-center h-screen font-mono">
      <div className="bg-white/20 border-slate-400/80 border rounded-md shadow-lg p-6 max-w-md">
        <div className="flex justify-between w-auto gap-2 h-10 mb-4">
          <h1 className="text-3xl font-bold mb-2">AnyChar Gen</h1>
          <a
            href="https://github.com/marcusdavidalo/savertracker"
            title="To AnyChar Generator Repository"
            className="w-10 h-auto"
          >
            <img src={logo} alt="AnyChar Generator Logo" />
          </a>
        </div>
        <div className="mb-6">
          <p className="text-gray-400 max-w-sm">
            This is a simple wordlist generation app built with React. This web
            app was made so I could try out and experiment using Web Workers.
          </p>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Enter input:</label>
          <input
            className="border rounded-lg py-2 px-4 bg-slate-800/40 w-full"
            type="text"
            value={input}
            onChange={(e) => handleInputChange(e.target.value)}
          />
          {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium  mb-1">
            Enter length:
          </label>
          <input
            className="border rounded-lg py-2 px-4 bg-slate-800/40 w-full"
            type="number"
            value={length}
            onChange={(e) => setLength(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap justify-center mb-4 gap-2">
          <button
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold px-2 py-1 rounded mb-2 w-[132px]"
            onClick={generateCombinations}
            disabled={loading}
          >
            {loading ? "Processing..." : "Generate Combinations"}
          </button>
          <button
            className="bg-green-500 hover:bg-green-600 text-white font-semibold px-2 py-1 rounded mb-2 w-[132px]"
            onClick={downloadCombinations}
            disabled={combinations.length === 0 || loading}
          >
            Download Combinations
          </button>
          <button
            className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold px-2 py-1 rounded mb-2 w-[132px]"
            onClick={() =>
              navigator.clipboard.writeText(combinations.join("\n"))
            }
            disabled={combinations.length === 0 || loading}
          >
            Copy Combinations
          </button>
          <button
            className="bg-red-500 hover:bg-red-600 text-white font-semibold px-2 py-1 rounded mb-2 w-[132px]"
            onClick={() => setCombinations([])}
            disabled={combinations.length === 0 || loading}
          >
            Clear Combinations
          </button>
        </div>
        <div className="mb-4">
          <h2 className="text-lg font-medium mb-2">Combinations:</h2>
          <div className="flex flex-wrap h-40 overflow-y-auto w-full">
            {combinations.map((combination, index) => (
              <div
                key={index}
                className="font-normal px-2 py-1 rounded-md border border-slate-500/25"
              >
                {combination}
              </div>
            ))}
          </div>
        </div>
        <footer className="mt-6 flex justify-between items-center bg-slate-600 px-4 py-2 rounded-md">
          <p className="text-gray-400">Created by Marcus David Alo</p>
          <a
            href="https://github.com/marcusdavidalo"
            target="_blank"
            rel="noopener noreferrer"
            className="ml-2"
            title="Marcus's Github"
          >
            <svg
              className="h-5 w-5 text-gray-200 hover:text-gray-500"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              viewBox="0 0 16 16"
            >
              {" "}
              <path d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.012 8.012 0 0 0 16 8c0-4.42-3.58-8-8-8z" />{" "}
            </svg>
          </a>
        </footer>
      </div>
    </div>
  );
}

export default App;
