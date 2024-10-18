// app/utils/ServerMonitor.ts

import { GameDig } from 'gamedig';
import { Pool } from 'pg';
import nodeFetch from 'node-fetch';
import FormDataNode from 'form-data';
import { setTimeout } from 'timers/promises';
import { ChartJSNodeCanvas } from 'chartjs-node-canvas';
import { ChartConfiguration, ChartData, ChartOptions } from 'chart.js';
import dotenv from 'dotenv';
import { createCanvas } from 'canvas';
dotenv.config({ path: '.env' });

console.log('Attempting to create database pool');
console.log('DB_URL:', process.env.DB_URL); // Add this line for debugging

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
  const width = 800;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d');

  // Set background
  ctx.fillStyle = '#2f3136';  // Discord dark theme background color
  ctx.fillRect(0, 0, width, height);

  // Prepare data
  const data = history.map(h => h.player_count);
  const maxCount = Math.max(...data, 10);
  const minCount = Math.min(...data, 0);

  // Chart area
  const padding = 60;
  const chartArea = {
    left: padding,
    right: width - padding / 2,
    top: padding,
    bottom: height - padding,
  };

  // Draw axes
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(chartArea.left, chartArea.top);
  ctx.lineTo(chartArea.left, chartArea.bottom);
  ctx.lineTo(chartArea.right, chartArea.bottom);
  ctx.stroke();

  // Draw ASCII-style chart
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 14px monospace';
  const chartWidth = 24;
  const chartHeight = 10;
  const cellWidth = (chartArea.right - chartArea.left) / chartWidth;
  const cellHeight = (chartArea.bottom - chartArea.top) / chartHeight;

  for (let i = 0; i < chartWidth; i++) {
    const index = Math.floor((i / chartWidth) * (data.length - 1));
    const value = data[index];
    const normalizedValue = Math.floor(((value - minCount) / (maxCount - minCount)) * chartHeight);
    
    for (let j = 0; j < chartHeight; j++) {
      const char = j >= chartHeight - normalizedValue ? '█' : '·';
      ctx.fillText(char, chartArea.left + i * cellWidth, chartArea.bottom - j * cellHeight);
    }
  }

  // Draw Y-axis labels
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 16px Arial';
  ctx.textAlign = 'right';
  ctx.textBaseline = 'middle';
  for (let i = 0; i <= 5; i++) {
    const y = chartArea.bottom - (i / 5) * (chartArea.bottom - chartArea.top);
    const value = Math.round(minCount + (i / 5) * (maxCount - minCount));
    ctx.fillText(value.toString(), chartArea.left - 10, y);
  }

  // Draw title
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 24px Arial';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText('Player Count Over Time', width / 2, 20);

  // Draw current player count
  const currentCount = data[data.length - 1];
  ctx.font = 'bold 20px Arial';
  ctx.textAlign = 'right';
  ctx.fillText(`Current: ${currentCount}`, chartArea.right, chartArea.top - 10);

  return canvas.toBuffer('image/png');
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

        const chartData = history.map(h => h.player_count).join(',');
        const embed = {
          title: `🎮 ${state.name} Server Status`,
          description: `Player count trend: \`${chartData}\``,
          fields: [
            { name: '👥 Players', value: `\`${state.players.length}/${state.maxplayers}\``, inline: true },
            { name: '🗺️ Map', value: `\`${state.map}\``, inline: true },
            { name: '🏷️ Game', value: `\`${getGameType(state)}\``, inline: true },
          ],
          color: 0x7289DA, // Discord blurple color
          timestamp: new Date().toISOString(),
          image: { url: 'attachment://chart.png' },
          footer: { text: 'Player count updated every minute' }
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



