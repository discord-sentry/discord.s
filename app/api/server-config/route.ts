import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM server_configs');
      return NextResponse.json(result.rows);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  const body = await request.json();
  const { guildId, channelId, gameType, serverIp, serverPort, messageInterval } = body;

  try {
    const client = await pool.connect();
    try {
      // Check if a configuration with the same server IP and port already exists for this guild
      const existingConfig = await client.query(
        'SELECT id FROM server_configs WHERE guild_id = $1 AND server_ip = $2 AND server_port = $3',
        [guildId, serverIp, serverPort]
      );

      if (existingConfig.rows.length > 0) {
        // Update existing configuration
        await client.query(
          `UPDATE server_configs 
          SET channel_id = $1, game_type = $2, message_interval = $3
          WHERE id = $4`,
          [channelId, gameType, messageInterval || 60, existingConfig.rows[0].id]
        );
      } else {
        // Insert new configuration
        await client.query(
          `INSERT INTO server_configs 
          (guild_id, channel_id, game_type, server_ip, server_port, message_interval) 
          VALUES ($1, $2, $3, $4, $5, $6)`,
          [guildId, channelId, gameType, serverIp, serverPort, messageInterval || 60]
        );
      }

      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
