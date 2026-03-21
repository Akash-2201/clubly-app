import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const supabaseUrl = 'https://hreuweolwjqjueafmblk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZXV3ZW9sd2pxanVlYWZtYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTU5MjIsImV4cCI6MjA4ODQ3MTkyMn0.RCUQ5zSh7A2FWLFZGBp26tLYj5MkduJ1RlJ51XWwVyY';

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});
