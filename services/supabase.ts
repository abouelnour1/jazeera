
import { createClient } from '@supabase/supabase-js';

// Credentials provided by the user
const supabaseUrl = 'https://ddojuobeewbyfqxttavx.supabase.co';
const supabaseKey = 'sb_publishable_1nttPDpRuAzPEeI4aNyxWA_5JwgkcVF';

export const supabase = createClient(supabaseUrl, supabaseKey);
