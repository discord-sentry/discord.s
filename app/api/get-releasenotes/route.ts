// app/api/get-releasenotes/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const owner = 'discord-sentry';
    const repo = 'discord.s';
    const tag = 'v0.9.0';
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases/tags/${tag}`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'NextJS-App'
      }
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`GitHub API responded with status ${response.status}. Body: ${errorBody}`);
      throw new Error(`GitHub API responded with status ${response.status}`);
    }

    const release = await response.json();

    const formattedRelease = {
      id: release.id,
      name: release.name,
      tag_name: release.tag_name,
      published_at: release.published_at,
      body: release.body
    };

    return NextResponse.json(formattedRelease);
  } catch (error) {
    console.error('Error fetching release notes:', error);
    if (error instanceof Error) {
      return NextResponse.json({ error: 'Failed to fetch release notes', details: error.message }, { status: 500 });
    } else {
      return NextResponse.json({ error: 'Failed to fetch release notes', details: 'An unknown error occurred' }, { status: 500 });
    }
  }
}
