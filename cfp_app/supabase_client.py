import os
from supabase import create_client, Client

SUPABASE_URL = "https://jpjmfxxjwoklcbrsrpqk.supabase.co"

_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Impwam1meHhqd29rbGNicnNycHFrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYxNzA3NjcsImV4cCI6MjA5MTc0Njc2N30.hgA29ZPKnjM4T46O3P0l518n0DO3dFPPTTcXFEd7x4M"

# Service role key bypasses RLS — required for the admin app to read/write all tables.
# Resolution order:
#   1. .streamlit/secrets.toml  → SUPABASE_SERVICE_KEY  (recommended for local dev)
#   2. Environment variable     → SUPABASE_SERVICE_KEY  (recommended for cloud hosting)
#   3. Anon key fallback        (read-only via RLS — writes will be blocked)
def _resolve_key() -> str:
    try:
        import streamlit as st
        key = st.secrets.get("SUPABASE_SERVICE_KEY")
        if key:
            return key
    except Exception:
        pass
    return os.getenv("SUPABASE_SERVICE_KEY") or _ANON_KEY

supabase: Client = create_client(SUPABASE_URL, _resolve_key())