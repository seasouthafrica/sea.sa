import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://xwbzjpppwuibyocmmmlc.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_8ONhHdLQZ08nGNA2v6tebQ_5cqe4C6u';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
