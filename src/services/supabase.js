import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SUPABASE_URL = 'https://eogevrmzyquwpslivxfk.supabase.co';
const SUPABASE_KEY = 'sb_publishable_36UqRL__625yv2Y0Y2Grmw_YBnoTfiU';

export const supabase = createClient(SUPABASE_URL, SUPABASE_KEY, {
    auth: {
        storage: AsyncStorage,
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false,
    },
});