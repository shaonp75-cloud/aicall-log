import { createClient, SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseConfig {
  url: string;
  anonKey: string;
  tableName: string;
}

const CONFIG_STORAGE_KEY = 'supabase_orders_config_v1';

const DEFAULT_URL = 'https://obfqzxjxdubzqbydazeh.supabase.co';
const DEFAULT_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9iZnF6eGp4ZHVienFieWRhemVoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE5MDU1ODAsImV4cCI6MjEwNzQ4MTU4MH0.KYliu7KPydbp3HogL6_RsXgZadnO1NBnFE7nrzGFfFY';
const DEFAULT_TABLE = 'dograh_log';

export function getStoredSupabaseConfig(): SupabaseConfig {
  try {
    const raw = localStorage.getItem(CONFIG_STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed.url && parsed.anonKey) {
        return {
          url: parsed.url.trim(),
          anonKey: parsed.anonKey.trim(),
          tableName: (parsed.tableName || DEFAULT_TABLE).trim(),
        };
      }
    }
  } catch {
    // Ignore storage parse error
  }

  // Check Vite env vars or fallback to user provided defaults
  const envUrl = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SUPABASE_URL || DEFAULT_URL;
  const envKey = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SUPABASE_ANON_KEY || DEFAULT_KEY;
  const envTable = (import.meta as unknown as { env: Record<string, string> }).env?.VITE_SUPABASE_TABLE || DEFAULT_TABLE;

  return {
    url: envUrl,
    anonKey: envKey,
    tableName: envTable,
  };
}

export function saveStoredSupabaseConfig(config: SupabaseConfig) {
  localStorage.setItem(CONFIG_STORAGE_KEY, JSON.stringify(config));
}

export function clearStoredSupabaseConfig() {
  localStorage.removeItem(CONFIG_STORAGE_KEY);
}

let cachedClient: SupabaseClient | null = null;
let cachedConfigKey = '';

export function getSupabaseClient(config: SupabaseConfig): SupabaseClient | null {
  if (!config.url || !config.anonKey) {
    return null;
  }
  const key = `${config.url}:::${config.anonKey}`;
  if (cachedClient && cachedConfigKey === key) {
    return cachedClient;
  }
  try {
    cachedClient = createClient(config.url, config.anonKey);
    cachedConfigKey = key;
    return cachedClient;
  } catch (err) {
    console.error('Failed to create Supabase client:', err);
    return null;
  }
}
