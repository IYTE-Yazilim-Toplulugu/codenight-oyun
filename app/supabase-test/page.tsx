'use client';

import React, { useState, useEffect } from 'react';
import { z } from 'zod';
import { supabase } from '@/lib/api';

// Define a simple schema for testing
const TestSchema = z.object({
  id: z.number(),
  name: z.string(),
  created_at: z.string().optional(),
});

export default function SupabaseTest() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Test Supabase authentication
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);

        // Test fetching data (this will depend on your Supabase schema)
        // Replace 'test_table' with an actual table in your Supabase database
        // const result = await supabaseFetcher('test_table', TestSchema);
        // setData(result);

        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <div>Loading...</div>;
  if (error) return <div>Error: {error}</div>;

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Supabase Integration Test</h1>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Authentication Status</h2>
        {user ? (
          <div>
            <p>Authenticated as: {user.email}</p>
            <p>User ID: {user.id}</p>
          </div>
        ) : (
          <p>Not authenticated</p>
        )}
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-2">Data from Supabase</h2>
        {data.length > 0 ? (
          <ul>
            {data.map((item) => (
              <li key={item.id} className="mb-2 p-2 border rounded">
                <p>ID: {item.id}</p>
                <p>Name: {item.name}</p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No data found or table doesn't exist yet.</p>
        )}
      </div>

      <div className="mt-6">
        <h2 className="text-xl font-semibold mb-2">How to Use</h2>
        <p className="mb-2">To test this integration:</p>
        <ol className="list-decimal list-inside">
          <li>Set up your Supabase project and add your URL and Anon Key to environment variables</li>
          <li>Create a table in your Supabase database</li>
          <li>Update the table name in the code above</li>
          <li>Try inserting, updating, or deleting data using the Supabase wrapper functions</li>
        </ol>
      </div>
    </div>
  );
}

