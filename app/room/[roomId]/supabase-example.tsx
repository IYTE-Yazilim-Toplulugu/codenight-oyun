'use client';

import { useEffect, useState } from 'react';
import { z } from 'zod';
import {
  supabaseFetcherSingle,
  supabaseFetcher,
  supabaseInsert,
  supabaseUpdate
} from '@/lib/api/supabase';

// Define Zod schemas for room and player data
const RoomSchema = z.object({
  id: z.string(),
  name: z.string(),
  created_at: z.string().optional(),
});

const PlayerSchema = z.object({
  id: z.string(),
  name: z.string(),
  room_id: z.string(),
  status: z.enum(['waiting', 'active', 'done']),
  created_at: z.string().optional(),
});

type Room = z.infer<typeof RoomSchema>;
type Player = z.infer<typeof PlayerSchema>;

export default function RoomSupabaseExample({ roomId }: { roomId: string }) {
  const [room, setRoom] = useState<Room | null>(null);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        // Fetch room data using roomId parameter
        const roomResult = await supabaseFetcherSingle(
          'rooms',
          RoomSchema,
          { id: roomId }  // Using the roomId from URL params
        );

        if (roomResult.error) {
          throw roomResult.error;
        }

        setRoom(roomResult.data);

        // Fetch players for this room
        const playersResult = await supabaseFetcher(
          'players',
          PlayerSchema,
          { room_id: roomId }  // Using the roomId to filter players
        );

        if (playersResult.error) {
          throw playersResult.error;
        }

        setPlayers(playersResult.data || []);
        setError(null);
      } catch (err) {
        setError(err.message);
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    if (roomId) {
      fetchData();
    }
  }, [roomId]);

  const addPlayer = async (playerName: string) => {
    try {
      const playerResult = await supabaseInsert(
        'players',
        PlayerSchema,
        {
          name: playerName,
          room_id: roomId,  // Associate player with current room
          status: 'waiting'
        }
      );

      if (playerResult.error) {
        throw playerResult.error;
      }

      // Add new player to state
      if (playerResult.data) {
        setPlayers(prev => [...prev, playerResult.data!]);
      }
    } catch (err) {
      setError(err.message);
      console.error('Error adding player:', err);
    }
  };

  const updatePlayerStatus = async (playerId: string, status: Player['status']) => {
    try {
      const updateResult = await supabaseUpdate(
        'players',
        PlayerSchema,
        { id: playerId },
        { status }
      );

      if (updateResult.error) {
        throw updateResult.error;
      }

      // Update player in state
      if (updateResult.data) {
        setPlayers(prev =>
          prev.map(player =>
            player.id === playerId ? updateResult.data! : player
          )
        );
      }
    } catch (err) {
      setError(err.message);
      console.error('Error updating player:', err);
    }
  };

  if (loading) return <div>Loading room data...</div>;
  if (error) return <div className="text-red-500">Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">
        Room: {room?.name || 'Unknown Room'}
      </h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Players in Room</h2>
        {players.length > 0 ? (
          <ul className="space-y-2">
            {players.map(player => (
              <li key={player.id} className="flex items-center justify-between p-2 border rounded">
                <div>
                  <span className="font-medium">{player.name}</span>
                  <span className="ml-2 text-sm text-gray-500">({player.status})</span>
                </div>
                <div className="space-x-2">
                  <button
                    onClick={() => updatePlayerStatus(player.id, 'waiting')}
                    className="px-2 py-1 bg-gray-200 rounded text-sm"
                  >
                    Waiting
                  </button>
                  <button
                    onClick={() => updatePlayerStatus(player.id, 'active')}
                    className="px-2 py-1 bg-blue-200 rounded text-sm"
                  >
                    Active
                  </button>
                  <button
                    onClick={() => updatePlayerStatus(player.id, 'done')}
                    className="px-2 py-1 bg-green-200 rounded text-sm"
                  >
                    Done
                  </button>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p>No players in this room yet.</p>
        )}
      </div>

      <div className="mt-6 p-4 bg-blue-50 rounded">
        <h3 className="font-bold mb-2">How roomId is used:</h3>
        <p>
          The roomId parameter from the URL (<code className="bg-gray-100 px-1 rounded">params.roomId</code>)
          is used to:
        </p>
        <ul className="list-disc list-inside mt-2 space-y-1">
          <li>Fetch room data: <code className="bg-gray-100 px-1 rounded">supabaseFetcherSingle('rooms', RoomSchema, {'{'} id: roomId {'}'})</code></li>
          <li>Fetch players in room: <code className="bg-gray-100 px-1 rounded">supabaseFetcher('players', PlayerSchema, {'{'} room_id: roomId {'}'})</code></li>
          <li>Add new players to room: <code className="bg-gray-100 px-1 rounded">supabaseInsert('players', PlayerSchema, {'{'} room_id: roomId, ... {'}'})</code></li>
        </ul>
      </div>
    </div>
  );
}

