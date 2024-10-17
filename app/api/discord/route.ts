// app/api/discord/route.ts
import { NextResponse } from 'next/server';

const DISCORD_API_URL = 'https://discord.com/api/v10';

// we use simple in-memory cache for rate limiting - for now
let lastRequestTime = 0;
const RATE_LIMIT_INTERVAL = 5000; // testing anything less than 5 seconds will cause rate limiting 

// Define a type for the request body
type DiscordRequestBody = {
  action: string;
  channelId?: string;
  content?: string;
  guildId?: string;
  name?: string;
  type?: number;
};

async function fetchFromDiscord(endpoint: string, method: string = 'GET', body?: Record<string, unknown>) {
  const now = Date.now();
  if (now - lastRequestTime < RATE_LIMIT_INTERVAL) {
    await new Promise(resolve => setTimeout(resolve, RATE_LIMIT_INTERVAL - (now - lastRequestTime)));
  }
  lastRequestTime = Date.now();

  const response = await fetch(`${DISCORD_API_URL}${endpoint}`, {
    method,
    headers: {
      'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!response.ok) {
    if (response.status === 429) {
      const retryAfter = parseInt(response.headers.get('Retry-After') || '5', 10);
      await new Promise(resolve => setTimeout(resolve, retryAfter * 1000));
      return fetchFromDiscord(endpoint, method, body); // Retry the request
    }
    throw new Error(`Discord API error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');

  try {
    switch (action) {
      case 'getGuilds':
        const guilds = await fetchFromDiscord('/users/@me/guilds');
        return NextResponse.json(guilds);

      case 'getChannels':
      case 'getGuild':
        const guildId = searchParams.get('guildId');
        if (!guildId) {
          return NextResponse.json({ error: 'Guild ID is required' }, { status: 400 });
        }
        
        if (action === 'getChannels') {
          const channels = await fetchFromDiscord(`/guilds/${guildId}/channels`);
          return NextResponse.json(channels);
        } else {
          const guild = await fetchFromDiscord(`/guilds/${guildId}`);
          return NextResponse.json(guild);
        }

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Discord API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body: DiscordRequestBody = await request.json();
  const { action } = body;

  try {
    switch (action) {
      case 'sendMessage':
        const { channelId, content } = body;
        if (!channelId || !content) {
          return NextResponse.json({ error: 'Channel ID and content are required' }, { status: 400 });
        }
        const message = await fetchFromDiscord(`/channels/${channelId}/messages`, 'POST', { content });
        return NextResponse.json(message);

      case 'createChannel':
        const { guildId, name, type } = body;
        if (!guildId || !name || type === undefined) {
          return NextResponse.json({ error: 'Guild ID, name, and type are required' }, { status: 400 });
        }
        const channel = await fetchFromDiscord(`/guilds/${guildId}/channels`, 'POST', { name, type });
        return NextResponse.json(channel);

      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }
  } catch (error) {
    console.error('Discord API error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
