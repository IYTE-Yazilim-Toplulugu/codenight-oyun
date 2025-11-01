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

// Define a schema for a sample table (replace with your actual table structure)
const TodoSchema = z.object({
  id: z.number(),
  title: z.string(),
  completed: z.boolean(),
  created_at: z.string().optional(),
});

type Todo = z.infer<typeof TodoSchema>;

export default function SupabaseCrudExample() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [newTodoTitle, setNewTodoTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all todos
  const fetchTodos = async () => {
    try {
      setLoading(true);
      // Replace 'todos' with your actual table name
      const result = await supabaseFetcher('todos', TodoSchema);
      setTodos(result);
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Add a new todo
  const addTodo = async () => {
    if (!newTodoTitle.trim()) return;

    try {
      setLoading(true);
      // Replace 'todos' with your actual table name
      const newTodo = await supabaseInsert('todos', TodoSchema, {
        title: newTodoTitle,
        completed: false,
      });

      setTodos([...todos, newTodo]);
      setNewTodoTitle('');
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Update a todo
  const updateTodo = async (id: number, completed: boolean) => {
    try {
      setLoading(true);
      // Replace 'todos' with your actual table name
      const updatedTodo = await supabaseUpdate(
        'todos',
        TodoSchema,
        { id },
        { completed }
      );

      setTodos(todos.map(todo => todo.id === id ? updatedTodo : todo));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Delete a todo
  const deleteTodo = async (id: number) => {
    try {
      setLoading(true);
      // Replace 'todos' with your actual table name
      await supabaseDelete('todos', { id });

      setTodos(todos.filter(todo => todo.id !== id));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Supabase CRUD Example</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          Error: {error}
        </div>
      )}

      <div className="mb-6 p-4 border rounded">
        <h2 className="text-xl font-semibold mb-2">Add New Todo</h2>
        <div className="flex gap-2">
          <input
            type="text"
            value={newTodoTitle}
            onChange={(e) => setNewTodoTitle(e.target.value)}
            placeholder="Enter todo title"
            className="flex-1 px-3 py-2 border rounded"
            disabled={loading}
          />
          <button
            onClick={addTodo}
            disabled={loading || !newTodoTitle.trim()}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:bg-gray-400"
          >
            Add
          </button>
        </div>
      </div>

      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-semibold">Todos</h2>
          <button
            onClick={fetchTodos}
            disabled={loading}
            className="px-4 py-2 bg-green-500 text-white rounded disabled:bg-gray-400"
          >
            Refresh
          </button>
        </div>

        {loading ? (
          <div>Loading...</div>
        ) : todos.length > 0 ? (
          <ul className="space-y-2">
            {todos.map((todo) => (
              <li key={todo.id} className="flex items-center justify-between p-3 border rounded">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={todo.completed}
                    onChange={(e) => updateTodo(todo.id, e.target.checked)}
                    className="mr-2"
                  />
                  <span className={todo.completed ? 'line-through text-gray-500' : ''}>
                    {todo.title}
                  </span>
                </div>
                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="px-3 py-1 bg-red-500 text-white rounded text-sm"
                >
                  Delete
                </button>
              </li>
            ))}
          </ul>
        ) : (
          <p>No todos found. Add some todos to get started!</p>
        )}
      </div>

      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
        <h3 className="font-bold mb-2">How to Use This Example</h3>
        <ol className="list-decimal list-inside space-y-1">
          <li>Set up your Supabase project and configure environment variables</li>
          <li>Create a "todos" table in your Supabase database with columns: id, title, completed, created_at</li>
          <li>Try adding, updating, and deleting todos using the interface above</li>
          <li>All operations use the Supabase wrapper functions with Zod validation</li>
        </ol>
      </div>
    </div>
  );
}

