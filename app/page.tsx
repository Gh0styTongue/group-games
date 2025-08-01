"use client"; // This component will use client-side features like useState and useEffect

import { useState } from "react";
import Image from "next/image";

// The main page component for the Roblox Group Games Finder
export default function Home() {
  // State to store the user's input for the Roblox Group ID
  const [groupId, setGroupId] = useState("");
  // State to hold the list of games fetched from the API
  const [games, setGames] = useState([]);
  // State to manage the loading status during API calls
  const [isLoading, setIsLoading] = useState(false);
  // State to store any error messages that occur
  const [error, setError] = useState(null);

  /**
   * Handles the search button click event.
   * This function will eventually call a Next.js API route to fetch data.
   * For now, it's a placeholder with a simulated delay.
   */
  const handleSearch = async () => {
    // Basic validation to ensure a Group ID is entered
    if (!groupId) {
      setError("Please enter a Roblox Group ID.");
      return;
    }

    // Reset previous states and show a loading indicator
    setError(null);
    setGames([]);
    setIsLoading(true);

    try {
      // In a real implementation, you would replace this with a fetch call
      // to your own Next.js API route, e.g.:
      // const response = await fetch(`/api/roblox-games?groupId=${groupId}`);
      //
      // For this example, we'll simulate a successful API response.
      // This simulated data will be replaced by real data from the Roblox API.
      const simulatedResponse = await new Promise((resolve) =>
        setTimeout(() => {
          resolve({
            ok: true,
            json: () =>
              Promise.resolve([
                { id: 1, name: "Simulated Game 1", thumbnailUrl: "https://placehold.co/150x150/png" },
                { id: 2, name: "Simulated Game 2", thumbnailUrl: "https://placehold.co/150x150/png" },
                { id: 3, name: "Simulated Game 3", thumbnailUrl: "https://placehold.co/150x150/png" },
              ]),
          });
        }, 1500)
      );
      
      const response = simulatedResponse;

      if (!response.ok) {
        throw new Error("Failed to fetch games. Please check the Group ID.");
      }

      const data = await response.json();
      setGames(data);
    } catch (err) {
      console.error(err);
      setError(err.message);
    } finally {
      // Always stop the loading indicator
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 sm:p-20 flex flex-col items-center justify-center bg-gray-900 text-white font-sans">
      <main className="flex flex-col items-center gap-8 w-full max-w-2xl bg-gray-800 p-8 rounded-xl shadow-lg">
        {/* Page Title */}
        <h1 className="text-4xl font-bold text-center text-blue-400">
          Roblox Group Games Finder
        </h1>
        <p className="text-lg text-gray-300 text-center">
          Enter a Roblox Group ID to find a list of their games.
        </p>

        {/* Input and Search Button */}
        <div className="flex flex-col sm:flex-row gap-4 w-full">
          <input
            type="text"
            className="flex-grow p-3 rounded-md bg-gray-700 text-white placeholder-gray-400 border border-transparent focus:border-blue-500 focus:outline-none transition-colors"
            placeholder="Enter Group ID"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            disabled={isLoading}
          />
          <button
            className="p-3 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            onClick={handleSearch}
            disabled={isLoading}
          >
            {isLoading ? "Searching..." : "Search"}
          </button>
        </div>

        {/* Dynamic Display Area */}
        <div className="w-full mt-4">
          {/* Loading state display */}
          {isLoading && (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          )}

          {/* Error state display */}
          {error && (
            <div className="text-red-400 text-center p-4 bg-red-900 rounded-md">
              <p>{error}</p>
            </div>
          )}

          {/* Games list display */}
          {games.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
              {games.map((game) => (
                <div
                  key={game.id}
                  className="bg-gray-700 rounded-lg overflow-hidden shadow-md"
                >
                  <Image
                    src={game.thumbnailUrl}
                    alt={`${game.name} thumbnail`}
                    width={150}
                    height={150}
                    className="w-full h-auto object-cover"
                    priority
                  />
                  <div className="p-4">
                    <h3 className="text-lg font-semibold text-gray-100">{game.name}</h3>
                    <a
                      href={`https://www.roblox.com/games/${game.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-400 hover:underline mt-2 inline-block"
                    >
                      Play Game
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Empty state display */}
          {!isLoading && !error && games.length === 0 && groupId && (
            <div className="text-center text-gray-500 p-4">
              No games found for this group.
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
