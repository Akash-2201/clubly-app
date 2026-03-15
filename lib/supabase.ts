import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';

const supabaseUrl = 'https://hreuweolwjqjueafmblk.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImhyZXV3ZW9sd2pxanVlYWZtYmxrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzI4OTU5MjIsImV4cCI6MjA4ODQ3MTkyMn0.RCUQ5zSh7A2FWLFZGBp26tLYj5MkduJ1RlJ51XWwVyY';

const getStorage = async () => {
  if (Platform.OS === 'web') return undefined;
  const { default: AsyncStorage } = await import('@react-native-async-storage/async-storage');
  return AsyncStorage;
};

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: Platform.OS !== 'web',
    detectSessionInUrl: false,
  },
});