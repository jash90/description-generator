"use client";
import { useState, useEffect } from "react";


export default function Home() {
  // State management for form input, results, etc.
  const [ean, setEan] = useState("");
  const [descriptionLength, setDescriptionLength] = useState<number>(300);
  const [result, setResult] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [history, setHistory] = useState<Array<{ id?: number; ean: string; description: string; createdAt?: string }>>([]);
  const [copied, setCopied] = useState(false);
  // New state to track which history items are expanded (by index)
  const [expandedHistory, setExpandedHistory] = useState<number[]>([]);

  // Validate that the EAN code is either 8 or 13 digits
  const isValidEAN = (code: string) => {
    return /^\d{8}$|^\d{13}$/.test(code);
  };

  // Helper function to fetch search history from the database
  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/searchHistory");
      if (res.ok) {
        const historyData = await res.json();
        setHistory(historyData);
      } else {
        console.error("Failed to fetch history");
      }
    } catch (error) {
      console.error("Error fetching history:", error);
    }
  };

  // Fetch history on initial mount
  useEffect(() => {
    fetchHistory();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setResult("");

    if (!isValidEAN(ean.trim())) {
      setError("Please enter a valid EAN code (8 or 13 digits).");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/generateDescription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ ean: ean.trim(), maxChars: descriptionLength }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "API error");
      }

      const data = await res.json();
      const description = data?.choices?.[0]?.message?.content || "";
      setResult(description);

      // Fetch updated search history from the database after saving
      // await fetchHistory();
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes("429")) {
        setError("Rate limit exceeded. Please try again later.");
      } else {
        setError("Failed to generate product description. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (copyError) {
      console.error("Failed to copy text:", copyError);
    }
  };

  return (
    <div className="min-h-screen p-8 pb-20 sm:p-20 font-sans bg-gray-100 dark:bg-gray-900 text-gray-900 dark:text-gray-100">
      <main className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-center">
          Product Description Generator
        </h1>

        <form onSubmit={handleSubmit} className="mb-6 flex flex-col gap-4">
          <label htmlFor="ean" className="text-lg font-medium">
            Enter EAN Code:
          </label>
          <input
            id="ean"
            type="text"
            value={ean}
            onChange={(e) => setEan(e.target.value)}
            placeholder="e.g., 1234567890123"
            className="p-3 rounded border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <label htmlFor="descriptionLength" className="text-lg font-medium">
            Description Length (characters):
          </label>
          <input
            id="descriptionLength"
            type="number"
            value={descriptionLength}
            onChange={(e) => setDescriptionLength(Number(e.target.value))}
            placeholder="300"
            className="p-3 rounded border border-gray-300 dark:border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {isLoading ? "Generating..." : "Generate Description"}
          </button>
        </form>

        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-200 text-red-800 rounded">
            {error}
          </div>
        )}

        {result && (
          <div className="mb-6 p-4 bg-white dark:bg-gray-800 rounded shadow">
            <div className="flex justify-between mb-2">
              <h2 className="text-xl font-semibold">
                Generated Description
              </h2>
              <button onClick={handleCopy} className="text-sm text-blue-600 hover:underline">
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
            <pre className="whitespace-pre-wrap text-sm">
              {result}
            </pre>
            <p className="mt-2 text-sm italic text-gray-500">
              The description includes product name/brand, key features and benefits,
              technical specifications, suggested use cases, and the target audience.
            </p>
          </div>
        )}

        {history.length > 0 && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Recent Searches</h3>
            <ul className="space-y-2">
              {history.map((item, index) => (
                <li
                  key={index}
                  className="p-3 bg-gray-200 dark:bg-gray-700 rounded cursor-pointer"
                  onClick={() =>
                    setExpandedHistory((prev) =>
                      prev.includes(index)
                        ? prev.filter((i) => i !== index)
                        : [...prev, index]
                    )
                  }
                >
                  <p className="font-medium">EAN: {item.ean}</p>
                  <p className="text-sm text-gray-700 dark:text-gray-300">
                    {expandedHistory.includes(index)
                      ? item.description
                      : item.description.substring(0, 100) +
                      (item.description.length > 100 ? "..." : "")}
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {expandedHistory.includes(index)
                      ? "Click to collapse"
                      : "Click to expand"}
                  </p>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      <footer className="mt-8 text-center">
        <a
          className="flex items-center justify-center gap-2 hover:underline"
          href="https://ai-service-hub.example.com"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-label="AI Service Hub Logo">
            <title>AI Service Hub Logo</title>
            <rect x="2" y="2" width="20" height="20" rx="3" fill="currentColor" />
            <text x="12" y="16" textAnchor="middle" fontSize="10" fill="black" fontFamily="Arial, sans-serif">AI</text>
          </svg>
          Powered by AI Service Hub
        </a>
      </footer>
    </div>
  );
}