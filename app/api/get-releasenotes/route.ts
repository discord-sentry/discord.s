// app/api/get-releasenotes/route.ts

import { NextResponse } from 'next/server';

export async function GET() {
  try {
    const owner = 'discord-sentry';
    const repo = 'discord.s';
    const apiUrl = `https://api.github.com/repos/${owner}/${repo}/releases?per_page=5`;

    const response = await fetch(apiUrl, {
      headers: {
        'Accept': 'application/vnd.github.v3+json',
        'User-Agent': 'NextJS-App'
      }
    });

    if (!response.ok) {
      throw new Error(`GitHub API responded with status ${response.status}`);
    }

    const releases = await response.json();

    const formattedReleases = releases.map((release: any) => ({
      id: release.id,
      name: release.name,
      tag_name: release.tag_name,
      published_at: release.published_at,
      body: release.body
    }));

    return NextResponse.json(formattedReleases);
  } catch (error) {
    console.error('Error fetching release notes:', error);
    return NextResponse.json({ error: 'Failed to fetch release notes' }, { status: 500 });
  }
}
