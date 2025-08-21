import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://nekhyesaspfjokemelos.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im5la2h5ZXNhc3Bmam9rZW1lbG9zIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTUxMTUzMDQsImV4cCI6MjA3MDY5MTMwNH0.OXFfBw8fgLUDVXwJkIsfSm0PQj_yggi2H0Te30Mmu3k'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export default supabase

