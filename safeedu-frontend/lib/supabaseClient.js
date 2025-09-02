// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// ใช้ process.env.<YOUR_PREFIX> เพื่อเข้าถึง Environment Variables
const supabaseUrl = process.env.REACT_APP_SUPABASE_URL || process.env.VITE_SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.REACT_APP_SUPABASE_ANON_KEY || process.env.VITE_SUPABASE_ANON_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error("Supabase URL or Anon Key is missing. Please check your .env.local file.");
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
