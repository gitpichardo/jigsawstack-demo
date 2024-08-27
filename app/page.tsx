'use client'

import React, { useState, useEffect } from 'react';
import { PrismLight as SyntaxHighlighter } from 'react-syntax-highlighter';
import json from 'react-syntax-highlighter/dist/cjs/languages/prism/json';
import { Moon, Sun, Sparkles, Globe, FileText, Image } from 'lucide-react';


SyntaxHighlighter.registerLanguage('json', json);

// Available AI models for image generation
const modelOptions = [
  { value: 'sdxl', label: 'Stable Diffusion XL' },
  { value: 'sd1.5', label: 'Stable Diffusion v1.5' },
  { value: 'ead1.0', label: 'Anime Diffusion' },
  { value: 'rv1.3', label: 'Realistic Vision v1.3' },
  { value: 'rv3', label: 'Realistic Vision v3' },
  { value: 'rv5.1', label: 'Realistic Vision v5.1' },
  { value: 'ar1.8', label: 'AbsoluteReality v1.8.1' },
];

// Interface for the result state
interface Result {
  success?: boolean;
  error?: string;
  details?: string;
  message?: string;
  output?: any;
  imageUrl?: string;
  summary?: string | string[];
  data?: string;
}

// Main component 
export default function Home() {
  // State variables for various functionalities
  const [text, setText] = useState('');
  const [url, setUrl] = useState('');
  const [result, setResult] = useState<Result | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('prompt');
  const [selectedModel, setSelectedModel] = useState('sdxl');
  const [elementPrompts, setElementPrompts] = useState(['']);
  const [prompt, setPrompt] = useState('');
  const [inputs, setInputs] = useState<{ key: string; value: string }[]>([]);
  const [darkMode, setDarkMode] = useState(false);
  const [imageResult, setImageResult] = useState<string | null>(null);

  // Clean up image URL when component unmounts or result changes
  useEffect(() => {
    return () => {
      if (result && result.imageUrl) {
        URL.revokeObjectURL(result.imageUrl);
      }
    };
  }, [result]);

  // Clear all state variables
  const clearState = () => {
    setText('');
    setUrl('');
    setResult(null);
    setPrompt('');
    setInputs([]);
    setElementPrompts(['']);
  };

   // Styles for output display
  const outputStyles = {
    container: "mt-6 max-w-3xl mx-auto p-4 rounded-lg shadow-lg",
    title: "text-xl font-semibold mb-4 text-center",
    content: "overflow-auto max-h-96",
    text: "whitespace-pre-wrap break-words",
    image: "max-w-full h-auto mx-auto rounded-lg shadow-md"
  };
  
   // Function to format and sanitize output text
  const formatOutput = (output: string) => {
    // Remove special characters except for common punctuation
    const sanitized = output.replace(/[^\w\s.,!?;:'"()-]/g, '');
    // Split into paragraphs for better readability
    return sanitized.split('\n').map(paragraph => paragraph.trim()).join('\n\n');
  };
  // Handler for changing tabs
  const handleTabChange = (tab: string) => {
    setActiveTab(tab);
    clearState();
  };

  // Handler for creating and running a prompt
  const handleCreateAndRunPrompt = async () => {
    setLoading(true);
    setResult(null);
    try {
      if (!prompt) {
        throw new Error('Prompt is required');
      }
  
      const response = await fetch('/api/prompt-engine/create-and-run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          query: prompt,
          inputs: inputs.reduce((acc, input) => {
            if (input.key && input.value) {
              acc[input.key] = input.value;
            }
            return acc;
          }, {} as Record<string, string>)
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'An error occurred');
      }
      
      const data = await response.json();
      setResult({ 
        message: 'Prompt executed successfully',
        output: formatOutput(data.result)
      });
    } catch (error) {
      console.error('Error creating and running prompt:', error);
      setResult({ 
        error: 'Failed to create and run prompt', 
        details: error instanceof Error ? error.message : String(error)
      });
    }
    setLoading(false);
  };

  // Handlers for AI web scraper functionality
  const handleAddPrompt = () => {
    setElementPrompts([...elementPrompts, '']);
  };

  const handleRemovePrompt = (index: number) => {
    const newPrompts = elementPrompts.filter((_, i) => i !== index);
    setElementPrompts(newPrompts);
  };

  const handlePromptChange = (index: number, value: string) => {
    const newPrompts = [...elementPrompts];
    newPrompts[index] = value;
    setElementPrompts(newPrompts);
  };

  const handleAiScrape = async () => {
    setLoading(true);
    setResult(null);
    try {
      if (!url) {
        throw new Error("Please enter a URL to scrape");
      }
      if (elementPrompts.length === 0 || elementPrompts.every(prompt => prompt.trim() === '')) {
        throw new Error("Please add at least one element prompt");
      }
      const response = await fetch('/api/ai-scrape', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          url,
          element_prompts: elementPrompts.filter(prompt => prompt.trim() !== '')
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      const formattedData = data.data.map((item: any) => {
        const prompt = item.selector;
        if (prompt.toLowerCase().includes('article title')) {
          const titles = item.results.map((result: any) => result.text).join('\n');
          return `Article Titles:\n${titles}`;
        } else {
          const results = item.results.map((result: any) => {
            if (typeof result === 'object') {
              return JSON.stringify(result, null, 2);
            }
            return result;
          }).join('\n');
          return `${prompt}:\n${results}`;
        }
      }).join('\n\n');
  
      setResult({ data: formattedData });
    } catch (error) {
      console.error('Error scraping:', error);
      setResult({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setLoading(false);
    }
  };

  // Handler for text summarization
  const handleSummary = async () => {
    setLoading(true);
    setResult(null);
    try {
      const response = await fetch('/api/summary', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          text,
          type: 'text'
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error summarizing:', error);
      setResult({ error: error instanceof Error ? error.message : 'An unknown error occurred' });
    } finally {
      setLoading(false);
    }
  };

   // Handler for image model selection
  const handleModelChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedModel(e.target.value);
  };

   // Handler for image generation
  const handleImageGeneration = async () => {
    setLoading(true);
    setImageResult(null); // Clear previous result
    try {
      const response = await fetch('/api/image-generation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: text,
          model: selectedModel,
          size: 'medium'
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const imageUrl = URL.createObjectURL(blob);
      setResult({ imageUrl });
    } catch (error) {
      console.error('Error generating image:', error);
      setResult({ 
        error: 'Failed to generate image', 
        message: error instanceof Error ? error.message : 'An unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  // Clean up object URL when component unmounts or when imageResult changes
  useEffect(() => {
    return () => {
      if (imageResult) {
        URL.revokeObjectURL(imageResult);
      }
    };
  }, [imageResult]);

  // Main render function
  return (
    <main className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900 text-gray-200' : 'bg-gray-100 text-gray-800'}`}>
      <nav className={`p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          <h1 className={`text-2xl font-bold ${darkMode ? 'text-gray-200' : 'text-gray-700'}`}>JigsawStacks AI Powered APIs</h1>
          <button onClick={() => setDarkMode(!darkMode)} className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700">
            {darkMode ? <Sun size={24} className="text-gray-300" /> : <Moon size={24} className="text-gray-600" />}
          </button>
        </div>
      </nav>

      <div className="flex-grow container mx-auto p-4 mt-8">
        <div className={`mb-4 flex justify-center ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-2`}>
          {[
            { name: 'prompt', icon: Sparkles },
            { name: 'scrape', icon: Globe },
            { name: 'summary', icon: FileText },
            { name: 'image', icon: Image }
          ].map(({ name, icon: Icon }) => (
            <button 
              key={name}
              onClick={() => handleTabChange(name)}
              className={`mr-2 px-4 py-2 rounded transition-colors flex items-center ${
                activeTab === name 
                  ? 'bg-blue-600 text-white' 
                  : `${darkMode ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-700'} hover:bg-blue-500 hover:text-white`
              }`}
            >
              <Icon size={18} className="mr-2" />
              {name.charAt(0).toUpperCase() + name.slice(1)}
            </button>
          ))}
        </div>

      <div className={`${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md p-6`}>
          {activeTab === 'prompt' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-2">Create Prompt</h2>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Enter your prompt here"
                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                rows={4}
              />
              <div>
                <button
                  onClick={() => setInputs([...inputs, { key: '', value: '' }])}
                  className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800 transition-colors"
                >
                  Add Input Field
                </button>
                {inputs.map((input, index) => (
                  <div key={index} className="flex items-center mt-2 space-x-2">
                    <input
                      type="text"
                      value={input.key}
                      onChange={(e) => {
                        const newInputs = [...inputs];
                        newInputs[index].key = e.target.value;
                        setInputs(newInputs);
                      }}
                      placeholder="Input key"
                      className={`flex-1 p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                    <input
                      type="text"
                      value={input.value}
                      onChange={(e) => {
                        const newInputs = [...inputs];
                        newInputs[index].value = e.target.value;
                        setInputs(newInputs);
                      }}
                      placeholder="Input value"
                      className={`flex-1 p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                    />
                    <button
                      onClick={() => setInputs(inputs.filter((_, i) => i !== index))}
                      className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                    >
                      Remove
                    </button>
                  </div>
                ))}
              </div>
              <button
                onClick={handleCreateAndRunPrompt}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Run Prompt
              </button>
            </div>
          )}

          {activeTab === 'scrape' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-2">AI Web Scraper</h2>
              <input
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="Enter URL to scrape (e.g., https://news.ycombinator.com)"
                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              />
              {elementPrompts.map((prompt, index) => (
                <div key={index} className="flex space-x-2">
                  <input
                    type="text"
                    value={prompt}
                    onChange={(e) => handlePromptChange(index, e.target.value)}
                    placeholder="Enter element to scrape (e.g., article title)"
                    className={`flex-grow p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                  />
                  <button
                    onClick={() => handleRemovePrompt(index)}
                    className="bg-red-600 text-white px-3 py-1 rounded hover:bg-red-700 transition-colors"
                  >
                    Remove
                  </button>
                </div>
              ))}
              <div className="flex justify-between">
                <button
                  onClick={handleAddPrompt}
                  className="bg-green-700 text-white px-3 py-1 rounded hover:bg-green-800 transition-colors"
                >
                  Add Element Prompt
                </button>
                <button 
                  onClick={handleAiScrape}
                  className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                >
                  Scrape
                </button>
              </div>

              {result && result.data && (
                <div className={`${outputStyles.container} ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className={outputStyles.title}>Scraped Data:</h2>
                  <pre className={`${outputStyles.text} ${outputStyles.content} ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {result.data}
                  </pre>
                </div>
              )}
            </div>
          )}

          {activeTab === 'summary' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-2">Text Summarizer</h2>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter text to summarize"
                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                rows={6}
              />
              <button 
                onClick={handleSummary}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
              >
                Summarize
              </button>
            </div>
          )}

          {activeTab === 'image' && (
            <div className="space-y-4">
              <h2 className="text-xl font-semibold mb-2">AI Image Generation</h2>
              <textarea
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter image description"
                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                rows={4}
              />
              <select
                value={selectedModel}
                onChange={handleModelChange}
                className={`w-full p-2 border rounded ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
              >
                {modelOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
              <button 
                onClick={handleImageGeneration}
                className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition-colors"
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate Image'}
              </button>

              {result && result.error && (
                <div className={`p-4 rounded-lg ${darkMode ? 'bg-red-900 text-red-200' : 'bg-red-100 text-red-700'}`}>
                  <p className="font-bold">{result.error}</p>
                  <p>{result.message || 'An unexpected error occurred.'}</p>
                </div>
              )}

              {result && result.imageUrl && (
                <div className={`${outputStyles.container} ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
                  <h2 className={outputStyles.title}>Generated Image:</h2>
                  <p className={`mb-2 text-center ${outputStyles.text}`}>
                    Model used: {modelOptions.find(m => m.value === selectedModel)?.label}
                  </p>
                  <div className="flex justify-center">
                    <img src={result.imageUrl} alt="Generated image" className={outputStyles.image} />
                  </div>
                </div>
              )}
            </div>
          )}

          {loading && (
            <div className="mt-4 flex justify-center">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500"></div>
            </div>
          )}

          {result && activeTab !== 'image' && activeTab !== 'scrape' && (
            <div className={`${outputStyles.container} ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
              <h2 className={outputStyles.title}>Output:</h2>
              <div className={outputStyles.content}>
                {result.error ? (
                  <p className="text-red-500 text-center">{result.error}</p>
                ) : result.message ? (
                  <div>
                    <p className={`text-green-400 text-center mb-2 ${outputStyles.text}`}>{result.message}</p>
                    {result.output && (
                      <pre className={`${outputStyles.text} ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                        {formatOutput(result.output)}
                      </pre>
                    )}
                  </div>
                ) : activeTab === 'summary' && result.summary ? (
                  <div className={`${outputStyles.text} ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {Array.isArray(result.summary) ? (
                      <ul className="list-disc list-inside">
                        {result.summary.map((point: string, index: number) => (
                          <li key={index} className="mb-1">{point}</li>
                        ))}
                      </ul>
                    ) : (
                      <p>{result.summary}</p>
                    )}
                  </div>
                ) : (
                  <pre className={`${outputStyles.text} ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                    {JSON.stringify(result, null, 2)}
                  </pre>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );}