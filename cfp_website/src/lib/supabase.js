import { createClient } from '@supabase/supabase-js'

const supabaseUrl = 'https://jpjmfxxjwoklcbrsrpqk.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwam1meHhqd29rbGNicnNycHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNzA3NjcsImV4cCI6MjA5MTc0Njc2N30.hgA29ZPKnjM4T46O3P0l518n0DO3dFPPTTcXFEd7x4M'

export const supabase = createClient(supabaseUrl, supabaseKey)
