import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const groupId = searchParams.get('groupId');
    const cursor = searchParams.get('cursor');
    const sortOrder = searchParams.get('sortOrder');

    if (!groupId) {
      return NextResponse.json({ error: 'Group ID is required' }, { status: 400 });
    }

    const gamesApiUrl = new URL(`https://games.roblox.com/v2/groups/${groupId}/gamesV2`);
    gamesApiUrl.searchParams.append('accessFilter', '1');
    gamesApiUrl.searchParams.append('limit', '100');
    if (sortOrder) {
      gamesApiUrl.searchParams.append('sortOrder', sortOrder);
    }
    if (cursor) {
      gamesApiUrl.searchParams.append('cursor', cursor);
    }

    const gamesResponse = await fetch(gamesApiUrl.toString());
    if (!gamesResponse.ok) {
      return NextResponse.json({ error: 'Failed to fetch games from Roblox API' }, { status: gamesResponse.status });
    }

    const gamesData = await gamesResponse.json();

    if (!gamesData.data || gamesData.data.length === 0) {
      return NextResponse.json({ data: [], nextPageCursor: null });
    }
    
    const placeIds = gamesData.data.map((game: any) => game.rootPlace.id);

    const placeDetailsApiUrl = new URL(`https://games.roblox.com/v1/games/multiget-place-details`);
    placeDetailsApiUrl.searchParams.append('placeIds', placeIds.join(','));

    const placeDetailsResponse = await fetch(placeDetailsApiUrl.toString());
    const placeDetailsData = placeDetailsResponse.ok ? await placeDetailsResponse.json() : [];

    const thumbnailsApiUrl = new URL(`https://thumbnails.roblox.com/v1/places/gameicons`);
    thumbnailsApiUrl.searchParams.append('placeIds', placeIds.join(','));
    thumbnailsApiUrl.searchParams.append('returnPolicy', 'PlaceHolder');
    thumbnailsApiUrl.searchParams.append('size', '150x150');
    thumbnailsApiUrl.searchParams.append('format', 'Png');
    thumbnailsApiUrl.searchParams.append('isCircular', 'false');

    const thumbnailsResponse = await fetch(thumbnailsApiUrl.toString());
    if (!thumbnailsResponse.ok) {
      console.error('Failed to fetch thumbnails from Roblox API');
    }

    const thumbnailsData = thumbnailsResponse.ok ? await thumbnailsResponse.json() : { data: [] };

    const gamesWithThumbnails = gamesData.data.map((game: any) => {
      const thumbnail = thumbnailsData.data.find((thumb: any) => thumb.targetId === game.rootPlace.id);
      const details = placeDetailsData.find((detail: any) => detail.placeId === game.rootPlace.id);
      return {
        ...game,
        thumbnailUrl: thumbnail ? thumbnail.imageUrl : `https://placehold.co/150x150/png?text=No+Image`,
        isPlayable: details ? details.isPlayable : false,
      };
    });

    return NextResponse.json({ data: gamesWithThumbnails, nextPageCursor: gamesData.nextPageCursor });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
