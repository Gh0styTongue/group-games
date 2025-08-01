import { NextResponse } from 'next/server';

// Define the API route handler for GET requests
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const cursor = searchParams.get('cursor');

    // Validate that a groupId was provided
    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    // Construct the URL for the Roblox games API
    const gamesApiUrl = new URL(`https://games.roblox.com/v2/groups/${groupId}/gamesV2`);
    gamesApiUrl.searchParams.append('accessFilter', '1');
    gamesApiUrl.searchParams.append('limit', '100');
    gamesApiUrl.searchParams.append('sortOrder', 'Asc');
    if (cursor) {
      gamesApiUrl.searchParams.append('cursor', cursor);
    }

    // Fetch game data from the Roblox API (server-side to bypass CORS)
    const gamesResponse = await fetch(gamesApiUrl.toString());
    if (!gamesResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch games from Roblox API' }, { status: gamesResponse.status });
    }

    const gamesData = await gamesResponse.json();

    if (!gamesData.data || gamesData.data.length === 0) {
      return NextResponse.json({ data: [], nextPageCursor: null });
    }
    
    // Extract placeIds from the games data
    const placeIds = gamesData.data.map((game: any) => game.rootPlace.id).join(',');

    // Fetch thumbnails for the games
    const thumbnailsApiUrl = new URL(`https://thumbnails.roblox.com/v1/places/place-thumbnails`);
    thumbnailsApiUrl.searchParams.append('placeIds', placeIds);
    thumbnailsApiUrl.searchParams.append('size', '150x150');
    thumbnailsApiUrl.searchParams.append('format', 'Png');

    const thumbnailsResponse = await fetch(thumbnailsApiUrl.toString());
    if (!thumbnailsResponse.ok) {
      // In case of a thumbnail fetch failure, we still return the game data without thumbnails
      console.error('Failed to fetch thumbnails from Roblox API');
    }

    const thumbnailsData = thumbnailsResponse.ok ? await thumbnailsResponse.json() : { data: [] };

    // Merge games data with thumbnail URLs
    const gamesWithThumbnails = gamesData.data.map((game: any) => {
      const thumbnail = thumbnailsData.data.find((thumb: any) => thumb.placeId === game.rootPlace.id);
      return {
        ...game,
        thumbnailUrl: thumbnail ? thumbnail.imageUrl : `https://placehold.co/150x150/png?text=No+Image`,
      };
    });

    return NextResponse.json({ data: gamesWithThumbnails, nextPageCursor: gamesData.nextPageCursor });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
