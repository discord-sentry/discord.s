import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { GameDig } from 'gamedig';

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

export async function GET() {
  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM server_configs');
      const servers = result.rows;

      const serverStatus = await Promise.all(servers.map(async (server) => {
        try {
          const state = await GameDig.query({
            type: server.game_type,
            host: server.server_ip,
            port: server.server_port,
          });

          const historyResult = await client.query(
            'SELECT timestamp, player_count FROM player_history WHERE server_config_id = $1 ORDER BY timestamp DESC LIMIT 24',
            [server.id]
          );

          return {
            id: server.id,
            name: state.name,
            game_type: server.game_type,
            server_ip: server.server_ip,
            server_port: server.server_port,
            status: 'online',
            players: state.players.length,
            max_players: state.maxplayers,
            player_history: historyResult.rows.reverse(),
          };
        } catch (error) {
          console.error(`Error querying game server ${server.server_ip}:${server.server_port}:`, error);
          return {
            id: server.id,
            name: 'Unknown',
            game_type: server.game_type,
            server_ip: server.server_ip,
            server_port: server.server_port,
            status: 'offline',
            players: 0,
            max_players: 0,
            player_history: [],
          };
        }
      }));

      return NextResponse.json(serverStatus);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
