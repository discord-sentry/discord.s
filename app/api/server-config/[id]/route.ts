import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DB_URL,
});

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;

  try {
    const client = await pool.connect();
    try {
      const result = await client.query('SELECT * FROM server_configs WHERE id = $1', [id]);
      if (result.rows.length === 0) {
        return NextResponse.json({ error: 'Server configuration not found' }, { status: 404 });
      }
      return NextResponse.json(result.rows[0]);
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;
  const body = await request.json();
  const { channel_id, game_type, server_ip, server_port, message_interval } = body;

  try {
    const client = await pool.connect();
    try {
      await client.query(
        `UPDATE server_configs 
        SET channel_id = $1, game_type = $2, server_ip = $3, server_port = $4, message_interval = $5
        WHERE id = $6`,
        [channel_id, game_type, server_ip, server_port, message_interval, id]
      );
      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  const id = params.id;

  try {
    const client = await pool.connect();
    try {
      await client.query('DELETE FROM server_configs WHERE id = $1', [id]);
      return NextResponse.json({ success: true });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Database error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
