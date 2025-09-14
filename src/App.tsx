import React, { useState, useEffect, useCallback } from 'react';
import { CheckIcon, XMarkIcon, ClipboardDocumentIcon } from '@heroicons/react/24/outline';

// Sample palindrome examples
const PALINDROME_EXAMPLES = [
  'A man, a plan, a canal: Panama',
  'race a car',
  'Was it a car or a cat I saw?',
  'No lemon, no melon',
  'Able was I, I saw Elba!',
  '12321',
  'Hello, world!',
];

interface CheckHistory {
  text: string;
  isPalindrome: boolean;
  timestamp: number;
}

function App() {
  const [input, setInput] = useState('');
  const [isPalindrome, setIsPalindrome] = useState<boolean | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [processedText, setProcessedText] = useState('');
  const [history, setHistory] = useState<CheckHistory[]>([]);
  const [copied, setCopied] = useState(false);

  // Check if a string is a palindrome
  const checkPalindrome = useCallback((text: string): { result: boolean; processed: string } => {
    // Remove all non-alphanumeric characters and convert to lowercase
    const processed = text.replace(/[^\w\s]|_/g, '').replace(/\s+/g, '').toLowerCase();
    // Compare the string with its reverse
    const result = processed === processed.split('').reverse().join('') && processed.length > 0;
    return { result, processed };
  }, []);

  // Handle input change with debounce
  useEffect(() => {
    if (input.trim() === '') {
      setIsPalindrome(null);
      setProcessedText('');
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(() => {
      const { result, processed } = checkPalindrome(input);
      setIsPalindrome(result);
      setProcessedText(processed);
      
      // Add to history if not already present
      if (processed) {
        setHistory(prev => [
          { text: input, isPalindrome: result, timestamp: Date.now() },
          ...prev.filter(item => item.text !== input).slice(0, 4) // Keep only last 5 items
        ]);
      }
      
      setIsLoading(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [input, checkPalindrome]);

  // Handle example click
  const handleExampleClick = (example: string) => {
    setInput(example);
  };

  // Clear input
  const clearInput = () => {
    setInput('');
    setIsPalindrome(null);
    setProcessedText('');
  };

  // Copy result to clipboard
  const copyToClipboard = () => {
    if (input) {
      navigator.clipboard.writeText(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Get stats from history
  const stats = history.reduce(
    (acc, curr) => {
      if (curr.isPalindrome) acc.palindromes++;
      else acc.nonPalindromes++;
      return acc;
    },
    { palindromes: 0, nonPalindromes: 0 }
  );

  return (
    <div className="min-h-screen flex flex-col">
      {/* Header */}
      <header className="bg-primary-600 text-white shadow-lg">
        <div className="container mx-auto px-4 py-6">
          <h1 className="text-3xl font-bold text-center">Palindrome Checker</h1>
          <p className="text-center mt-2 text-primary-100">Check if your text is a palindrome</p>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-grow container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          {/* Input section */}
          <div className="card p-6 mb-8">
            <div className="relative">
              <textarea
                className="input min-h-[120px] text-lg"
                placeholder="Type or paste your text here..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                aria-label="Text input for palindrome checking"
              />
              {input && (
                <button
                  onClick={clearInput}
                  className="absolute top-3 right-3 p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                  aria-label="Clear input"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              )}
            </div>

            {/* Result section */}
            <div className="mt-6">
              {input && (
                <div className={`p-4 rounded-lg transition-colors duration-300 ${
                  isLoading ? 'bg-gray-100 dark:bg-gray-700' :
                  isPalindrome === true ? 'bg-green-50 dark:bg-green-900/20' :
                  isPalindrome === false ? 'bg-red-50 dark:bg-red-900/20' : 'bg-gray-50 dark:bg-gray-800'
                }`}>
                  {isLoading ? (
                    <div className="flex items-center justify-center space-x-2">
                      <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                      <span>Checking...</span>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        {isPalindrome ? (
                          <CheckIcon className="h-6 w-6 text-green-500" />
                        ) : (
                          <XMarkIcon className="h-6 w-6 text-red-500" />
                        )}
                        <div>
                          <p className="font-medium">
                            {isPalindrome ? 'This is a palindrome!' : 'Not a palindrome'}
                          </p>
                          {processedText && (
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              Processed: "{processedText}" ({processedText.length} characters)
                            </p>
                          )}
                        </div>
                      </div>
                      <button
                        onClick={copyToClipboard}
                        className="p-2 text-gray-500 hover:text-primary-600 dark:text-gray-400 dark:hover:text-primary-400"
                        title="Copy to clipboard"
                      >
                        <ClipboardDocumentIcon className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Stats section */}
          {history.length > 0 && (
            <div className="card p-6 mb-8">
              <h2 className="text-xl font-semibold mb-4">Your Stats</h2>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
                  <p className="text-3xl font-bold text-green-600 dark:text-green-400">
                    {stats.palindromes}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">Palindromes</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg">
                  <p className="text-3xl font-bold text-red-600 dark:text-red-400">
                    {stats.nonPalindromes}
                  </p>
                  <p className="text-gray-600 dark:text-gray-400">Non-palindromes</p>
                </div>
              </div>
            </div>
          )}

          {/* Examples section */}
          <div className="card p-6">
            <h2 className="text-xl font-semibold mb-4">Try these examples</h2>
            <div className="flex flex-wrap gap-2">
              {PALINDROME_EXAMPLES.map((example, index) => (
                <button
                  key={index}
                  onClick={() => handleExampleClick(example)}
                  className="px-3 py-1.5 text-sm rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors"
                >
                  "{example}"
                </button>
              ))}
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 dark:bg-gray-800 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600 dark:text-gray-400">
          <p>© {new Date().getFullYear()} Palindrome Checker</p>
        </div>
      </footer>

      {/* Copied notification */}
      {copied && (
        <div className="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg flex items-center space-x-2 animate-fade-in-out">
          <CheckIcon className="h-5 w-5" />
          <span>Copied to clipboard!</span>
        </div>
      )}
    </div>
  );
}

export default App;
