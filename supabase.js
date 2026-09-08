import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm';

const SUPABASE_URL = 'https://spdszkdhldqdkamaqyqq.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_29t_5zr5t17qlkV0zkJZJg_POfwqQze';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
