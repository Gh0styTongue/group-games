"use client"; // This component will use client-side features like useState and useEffect

import { useState } from "react";
import Image from "next/image";

// Define the type for a Roblox game object based on the API response
interface Game {
  id: number;
  name: string;
  description: string | null;
  creator: {
    id: number;
    type: string;
  };
  rootPlace: {
    id: number;
    type: string;
  };
  created: string;
  updated: string;
  placeVisits: number;
  thumbnailUrl?: string; // Add optional thumbnail URL field
}

// The main page component for the Roblox Group Games Finder
export default function Home() {
  // State to store the user's input for the Roblox Group ID
  const [groupId, setGroupId] = useState("");
  // State to hold the list of games fetched from the API, now with a defined type
  const [games, setGames] = useState<Game[]>([]);
  // State to manage the loading status during API calls
  const [isLoading, setIsLoading] = useState(false);
  // State to store any error messages that occur. The state is now typed to accept both string and null.
  const [error, setError] = useState<string | null>(null);
  // State to hold the cursor for the next page of results
  const [nextPageCursor, setNextPageCursor] = useState<string | null>(null);

  /**
   * Fetches games for a given group ID and an optional pagination cursor.
   * This function now calls a local API route to bypass CORS.
   *
   * @param cursor The cursor for the next page of results.
   */
  const fetchGames = async (cursor: string | null = null) => {
    // Show a loading indicator
    setIsLoading(true);
    setError(null);

    // Add a robust check before constructing the URL
    if (!groupId) {
      setError("Please enter a Roblox Group ID.");
      setIsLoading(false);
      return;
    }

    try {
      const apiUrl = new URL(`/api/roblox-games`);
      apiUrl.searchParams.append('groupId', groupId);
      if (cursor) {
        apiUrl.searchParams.append('cursor', cursor);
      }

      // Fetch game list from local API route
      const gamesResponse = await fetch(apiUrl.toString());
      if (!gamesResponse.ok) {
        // If the local API route returns an error, read the error message
        const errorData = await gamesResponse.json();
        throw new Error(errorData.error);
      }
      const gamesData = await gamesResponse.json();

      if (gamesData.data.length === 0) {
        setGames([]);
        setNextPageCursor(null);
        return;
      }

      // Merge game data with their respective thumbnail URLs (this logic is now in the API route)
      // The API route will return a combined data structure
      const gamesWithThumbnails: Game[] = gamesData.data;
      
      // Update the games state, appending new games if a cursor was used
      setGames(prevGames => [...prevGames, ...gamesWithThumbnails]);
      setNextPageCursor(gamesData.nextPageCursor);

    } catch (err) {
      console.error(err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("An unknown error occurred.");
      }
    } finally {
      // Always stop the loading indicator
      setIsLoading(false);
    }
  };

  /**
   * Handles the initial search button click.
   */
  const handleSearch = () => {
    if (!groupId) {
      setError("Please enter a Roblox Group ID.");
      return;
    }
    
    // Reset states for a new search
    setGames([]);
    setNextPageCursor(null);
    fetchGames(null);
  };
  
  /**
   * Handles the "Load More" button click.
   */
  const handleLoadMore = () => {
    if (nextPageCursor) {
      fetchGames(nextPageCursor);
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
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className="bg-gray-700 rounded-lg overflow-hidden shadow-md"
                  >
                    <Image
                      src={game.thumbnailUrl || `https://placehold.co/150x150/png?text=No+Image`}
                      alt={`${game.name} thumbnail`}
                      width={150}
                      height={150}
                      className="w-full h-auto object-cover"
                      priority
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-100">{game.name}</h3>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-3">{game.description}</p>
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
              {/* Load More Button */}
              {nextPageCursor && (
                <div className="text-center mt-8">
                  <button
                    className="p-3 rounded-md bg-blue-500 text-white font-semibold hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    onClick={handleLoadMore}
                    disabled={isLoading}
                  >
                    {isLoading ? "Loading..." : "Load More"}
                  </button>
                </div>
              )}
            </>
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
