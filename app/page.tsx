"use client";

import { useState } from "react";
import Image from "next/image";

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
  thumbnailUrl?: string;
  isPlayable: boolean;
}

export default function Home() {
  const [groupId, setGroupId] = useState("");
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [nextPageCursor, setNextPageCursor] = useState<string | null>(null);

  const fetchGames = async (cursor: string | null = null) => {
    setIsLoading(true);
    setError(null);

    if (!groupId) {
      setError("Please enter a Roblox Group ID.");
      setIsLoading(false);
      return;
    }

    try {
      let apiUrl = `/api/roblox-games?groupId=${groupId}`;
      if (cursor) {
        apiUrl += `&cursor=${cursor}`;
      }
      // Add a sort order parameter to the request
      apiUrl += `&sortOrder=Desc`;

      const gamesResponse = await fetch(apiUrl);
      if (!gamesResponse.ok) {
        const errorData = await gamesResponse.json();
        throw new Error(errorData.error);
      }
      const gamesData = await gamesResponse.json();

      if (gamesData.data.length === 0) {
        setGames([]);
        setNextPageCursor(null);
        return;
      }

      const gamesWithThumbnails: Game[] = gamesData.data;
      
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
      setIsLoading(false);
    }
  };

  const handleSearch = () => {
    if (!groupId) {
      setError("Please enter a Roblox Group ID.");
      return;
    }
    
    setGames([]);
    setNextPageCursor(null);
    fetchGames(null);
  };
  
  const handleLoadMore = () => {
    if (nextPageCursor) {
      fetchGames(nextPageCursor);
    }
  };

  const formatDateTime = (isoString: string) => {
    const date = new Date(isoString);
    return date.toLocaleString();
  };
  
  const formatNumber = (num: number) => {
    return num.toLocaleString();
  }

  return (
    <div className="min-h-screen p-8 sm:p-20 flex flex-col items-center justify-center bg-gray-900 text-white font-sans">
      <main className="flex flex-col items-center gap-8 w-full max-w-2xl bg-gray-800 p-8 rounded-xl shadow-lg">
        <h1 className="text-4xl font-bold text-center text-blue-400">
          Roblox Group Games Finder
        </h1>
        <p className="text-lg text-gray-300 text-center">
          Enter a Roblox Group ID to find a list of their games.
        </p>

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

        <div className="w-full mt-4">
          {isLoading && (
            <div className="flex justify-center items-center h-24">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent"></div>
            </div>
          )}

          {error && (
            <div className="text-red-400 text-center p-4 bg-red-900 rounded-md">
              <p>{error}</p>
            </div>
          )}

          {games.length > 0 && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
                {games.map((game) => (
                  <div
                    key={game.id}
                    className={`bg-gray-700 rounded-lg overflow-hidden shadow-md`}
                  >
                    <Image
                      src={game.thumbnailUrl || `https://placehold.co/150x150/png?text=No+Image`}
                      alt={`${game.name} thumbnail`}
                      width={150}
                      height={150}
                      className="w-full h-auto object-cover"
                      unoptimized
                      priority
                    />
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-gray-100">{game.name}</h3>
                      <p className="text-sm text-gray-400 mt-1 line-clamp-3">{game.description}</p>
                      <div className="mt-4 text-xs text-gray-400 space-y-1">
                        <p>
                          <span className="font-semibold text-gray-300">Created:</span> {formatDateTime(game.created)}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-300">Updated:</span> {formatDateTime(game.updated)}
                        </p>
                        <p>
                          <span className="font-semibold text-gray-300">Visits:</span> {formatNumber(game.placeVisits)}
                        </p>
                      </div>
                      <a
                        href={`https://www.roblox.com/games/${game.rootPlace.id}`}
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
