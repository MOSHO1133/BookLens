import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.EXPO_PUBLIC_SUPABASE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});

// Save book to user library
export const saveBook = async (book) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;
    const { error } = await supabase.from('user_library').upsert({
        user_id: user.id,
        book_id: book.id,
        title: book.title,
        author: book.author,
        cover_url: book.coverUrl,
        status: book.status || 'want',
        rating: book.rating,
        source: book.source || 'openlibrary',
    });
    return error;
};

// Get user library
export const getUserLibrary = async () => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return [];
    const { data } = await supabase
        .from('user_library')
        .select('*')
        .eq('user_id', user.id);
    return data || [];
};