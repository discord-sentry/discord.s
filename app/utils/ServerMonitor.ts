// app/utils/game-status-updater.ts

import { GameDig } from 'gamedig';
import { Pool } from 'pg';
import nodeFetch from 'node-fetch';
import FormDataNode from 'form-data';
import { setTimeout } from 'timers/promises';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';

console.log('Attempting to create database pool');
const pool = new Pool({
  connectionString: process.env.DB_URL,
});

pool.on('error', (err: Error) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

async function initializeDatabase() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // we let sql create the table for us
    await client.query(`
      CREATE TABLE IF NOT EXISTS server_configs (
        id SERIAL PRIMARY KEY,
        guild_id TEXT NOT NULL,
        channel_id TEXT NOT NULL,
        game_type TEXT NOT NULL,
        server_ip TEXT NOT NULL,
        server_port INTEGER NOT NULL,
        message_id TEXT,
        message_interval INTEGER NOT NULL DEFAULT 60
      )
    `);

    await client.query(`
      CREATE TABLE IF NOT EXISTS player_history (
        id SERIAL PRIMARY KEY,
        server_config_id INTEGER REFERENCES server_configs(id),
        timestamp TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        player_count INTEGER NOT NULL
      )
    `);

    await client.query(`
      DO $$ 
      BEGIN
        IF EXISTS (
          SELECT 1 FROM pg_constraint 
          WHERE conname = 'server_configs_guild_id_key'
        ) THEN
          ALTER TABLE server_configs 
          DROP CONSTRAINT server_configs_guild_id_key;
        END IF;
      END $$;
    `);

    await client.query('COMMIT');
    console.log('Database initialized successfully');
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error initializing database:', error);
    throw error; // we re-throw the error just if
  } finally {
    client.release();
  }
}

async function sendOrUpdateDiscordMessage(channelId: string, embed: any, messageId?: string, chartBuffer?: Buffer) {
  console.log(`Attempting to ${messageId ? 'update' : 'send'} message in channel: ${channelId}`);
  try {
    const url = messageId
      ? `https://discord.com/api/v10/channels/${channelId}/messages/${messageId}`
      : `https://discord.com/api/v10/channels/${channelId}/messages`;

    const method = messageId ? 'PATCH' : 'POST';

    const formData = new FormDataNode();
    formData.append('payload_json', JSON.stringify({ embeds: [embed] }));
    if (chartBuffer) {
      formData.append('files[0]', chartBuffer, { filename: 'chart.png' });
    }

    const response = await nodeFetch(url, {
      method: method,
      headers: {
        'Authorization': `Bot ${process.env.DISCORD_BOT_TOKEN}`,
      },
      body: formData
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Failed to ${messageId ? 'update' : 'send'} Discord message: ${response.status} ${response.statusText}\n${errorText}`);
    }

    const messageData = await response.json();
    console.log(`Successfully ${messageId ? 'updated' : 'sent'} message in channel: ${channelId}`);
    return messageData.id;
  } catch (error) {
    console.error(`Error ${messageId ? 'updating' : 'sending'} Discord message in channel ${channelId}:`, error);
    return null;
  }
}

async function generateChartImage(history: any[]) {
  const width = 400;
  const height = 200;
  const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour: 'white' });

  const labels = history.map(h => new Date(h.timestamp).toLocaleTimeString());
  const data = history.map(h => h.player_count);

  const chartData: ChartData = {
    labels: labels,
    datasets: [{
      label: 'Players',
      data: data,
      fill: false,
      borderColor: 'rgb(75, 192, 192)',
      tension: 0.1
    }]
  };

  const chartOptions: ChartOptions = {
    scales: {
      y: {
        beginAtZero: true,
        title: {
          display: true,
          text: 'Player Count'
        }
      },
      x: {
        title: {
          display: true,
          text: 'Time'
        }
      }
    },
    plugins: {
      title: {
        display: true,
        text: 'Player Count Over Time'
      },
      legend: {
        display: false
      }
    }
  };

  const configuration: ChartConfiguration = {
    type: 'line',
    data: chartData,
    options: chartOptions
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

async function updateGameStatus() {
  console.log('Starting game status update...');
  let client;
  try {
    client = await pool.connect();
    console.log('Successfully connected to the database');
    const result = await client.query('SELECT * FROM server_configs');
    console.log(`Found ${result.rows.length} server configurations`);
    for (const row of result.rows) {
      console.log(`Updating status for server: ${row.server_ip}:${row.server_port}`);
      try {
        const state = await GameDig.query({
          type: row.game_type,
          host: row.server_ip,
          port: parseInt(row.server_port),
        });

        console.log('GameDig query result:', state);

        // Store the player count in the history
        await client.query(
          'INSERT INTO player_history (server_config_id, player_count) VALUES ($1, $2)',
          [row.id, state.players.length]
        );

        const historyResult = await client.query(
          'SELECT timestamp, player_count FROM player_history WHERE server_config_id = $1 ORDER BY timestamp DESC LIMIT 24',
          [row.id]
        );
        const history = historyResult.rows.reverse();

        // Generate chart image
        const chartBuffer = await generateChartImage(history);

        const embed = {
          title: `🎮 ${state.name} Server Status`,
          fields: [
            { name: '👥 Players', value: `\`${state.players.length}/${state.maxplayers}\``, inline: true },
            { name: '🗺️ Map', value: `\`${state.map}\``, inline: true },
            { name: '🏷️ Game', value: `\`${getGameType(state)}\``, inline: true },
          ],
          color: 0x2F3136, // Dark embed color
          timestamp: new Date().toISOString(),
          image: { url: 'attachment://chart.png' }
        };

        if (state.players.length > 0) {
          const playerList = state.players
            .map((p: any) => p.name || 'Unknown')
            .sort((a: string, b: string) => a.localeCompare(b))
            .join('\n');
          
          const formattedPlayerList = `\`\`\`\n${playerList}\`\`\``;
          
          embed.fields.push({ 
            name: `📋 Player List (${state.players.length})`, 
            value: formattedPlayerList.length > 1024 
              ? formattedPlayerList.substring(0, 1021) + '...'
              : formattedPlayerList,
            inline: false 
          });
        }

        embed.fields.push({
          name: '🔗 Connect',
          value: `\`${state.connect}\``,
          inline: false
        });

        if (state.version) {
          embed.fields.push({
            name: '📊 Version',
            value: `\`${state.version}\``,
            inline: true
          });
        }

        if (state.ping !== undefined) {
          embed.fields.push({
            name: '📶 Ping',
            value: `\`${state.ping}ms\``,
            inline: true
          });
        }

        const messageId = await sendOrUpdateDiscordMessage(row.channel_id, embed, row.message_id, chartBuffer);
        if (messageId && messageId !== row.message_id) {
          await client.query('UPDATE server_configs SET message_id = $1 WHERE id = $2', [messageId, row.id]);
          console.log(`Updated message_id for server config ${row.id}`);
        }

        // Add a delay between server queries to avoid rate limiting
        await setTimeout(1000);
      } catch (error) {
        console.error(`Error querying game server ${row.server_ip}:${row.server_port}:`, error);
        if (error instanceof Error) {
          console.error('Error stack:', error.stack);
        }
        const errorEmbed = {
          title: 'Server Status Error',
          description: `Unable to query the game server at ${row.server_ip}:${row.server_port}`,
          color: 0xff0000, // Red color
          timestamp: new Date().toISOString(),
        };
        await sendOrUpdateDiscordMessage(row.channel_id, errorEmbed, row.message_id);
      }
    }
  } catch (error) {
    console.error('Error in updateGameStatus:', error);
    if (error instanceof Error) {
      if (error.message.includes('ECONNREFUSED')) {
        console.error('Could not connect to the database. Please check if the database is running and the connection details are correct.');
      } else {
        console.error('Database error:', error.message);
      }
    }
  } finally {
    if (client) {
      await client.release();
    }
  }
}

function getGameType(state: any): string {
  if (state.raw && typeof state.raw === 'object' && 'game' in state.raw) {
    return state.raw.game;
  }
  return 'N/A';
}

async function initializeUpdater() {
  try {
    await initializeDatabase();
    setInterval(updateGameStatus, 60000);
    console.log('Game status updater initialized');

    await updateGameStatus();
  } catch (error) {
    console.error('Error initializing updater:', error);
    process.exit(1); // we exit if the intializing fails
  }
}

export { initializeUpdater };

// the bot wont have a online statys 

