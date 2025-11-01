'use client';

import React, { useState } from 'react';
import { z } from 'zod';
import {
  supabaseFetcher,
  supabaseFetcherSingle,
  supabaseInsert,
  supabaseUpdate,
  supabaseDelete
} from '@/lib/api/supabase';

// Define a simple schema for testing
const TestSchema = z.object({
  id: z.number(),
  name: z.string(),
  description: z.string().optional(),
  created_at: z.string().optional(),
});

type TestItem = z.infer<typeof TestSchema>;

export default function SupabaseServiceKeyTest() {
  const [testResults, setTestResults] = useState<string[]>([]);
  const [isTesting, setIsTesting] = useState(false);

  const addResult = (message: string) => {
    setTestResults(prev => [...prev, message]);
  };

  const runTests = async () => {
    setIsTesting(true);
    setTestResults([]);

    try {
      // Test 1: Fetch data
      addResult('1. Testing data fetch...');
      const fetchResult = await supabaseFetcher('test_table', TestSchema);
      addResult(`   Fetch successful. Found ${fetchResult.data?.length || 0} items.`);

      // Test 2: Insert data
      addResult('2. Testing data insert...');
      const insertResult = await supabaseInsert('test_table', TestSchema, {
        name: 'Test Item',
        description: 'This is a test item created with service key'
      });
      const insertedId = insertResult.data?.id;
      addResult(`   Insert successful. Created item with ID: ${insertedId}`);

      // Test 3: Update data
      if (insertedId) {
        addResult('3. Testing data update...');
        const updateResult = await supabaseUpdate(
          'test_table',
          TestSchema,
          { id: insertedId },
          { name: 'Updated Test Item' }
        );
        addResult(`   Update successful. Updated item ID: ${updateResult.data?.id}`);
      }

      // Test 4: Fetch single item
      if (insertedId) {
        addResult('4. Testing single item fetch...');
        const singleResult = await supabaseFetcherSingle(
          'test_table',
          TestSchema,
          { id: insertedId }
        );
        addResult(`   Single fetch successful. Item name: ${singleResult.data?.name}`);
      }

      // Test 5: Delete data
      if (insertedId) {
        addResult('5. Testing data delete...');
        const deleteResult = await supabaseDelete('test_table', { id: insertedId });
        if (deleteResult.data) {
          addResult(`   Delete successful.`);
        } else {
          addResult(`   Delete failed: ${deleteResult.error?.message}`);
        }
      }

      addResult('All tests completed successfully!');
    } catch (error) {
      addResult(`Error during testing: ${error.message}`);
      console.error(error);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Supabase Service Key Test</h1>

      <div className="mb-6">
        <p className="mb-4">
          This page tests the Supabase integration using the service key client,
          which bypasses Row Level Security (RLS) and allows full access to all data.
        </p>

        <button
          onClick={runTests}
          disabled={isTesting}
          className="px-4 py-2 bg-blue-600 text-white rounded disabled:bg-gray-400"
        >
          {isTesting ? 'Running Tests...' : 'Run Service Key Tests'}
        </button>
      </div>

      <div className="border rounded p-4">
        <h2 className="text-xl font-semibold mb-2">Test Results</h2>
        {testResults.length > 0 ? (
          <ul className="space-y-2">
            {testResults.map((result, index) => (
              <li key={index} className="font-mono text-sm">
                {result}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-gray-500">Click "Run Service Key Tests" to start testing.</p>
        )}
      </div>

      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded">
        <h3 className="font-bold mb-2">Important Notes:</h3>
        <ul className="list-disc list-inside space-y-1">
          <li>The service key client bypasses RLS and has full admin access to your database</li>
          <li>This should only be used for backend operations, not frontend/client-side code</li>
          <li>Make sure to replace 'test_table' with an actual table in your Supabase database</li>
          <li>Ensure your SUPABASE_SERVICE_KEY environment variable is properly set</li>
        </ul>
      </div>
    </div>
  );
}

