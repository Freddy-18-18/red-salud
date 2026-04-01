#!/usr/bin/env python3
"""Fix the .env.local file with the correct Supabase credentials."""
import os

env_path = os.path.join(os.path.dirname(__file__), '.env.local')

url = 'https://hwckkfiirldgundbcjsp.supabase.co'
key = (
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9'
    '.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh3Y2trZmlpcmxkZ3VuZGJjanNwIiwi'
    'cm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMDA4MjcsImV4cCI6MjA3Nzc3NjgyN30'
    '.6Gh2U3mx7NsePvQEYMGnh23DqhJV43QRlPvYRynO8fY'
)

with open(env_path, 'w') as f:
    f.write(f'NEXT_PUBLIC_SUPABASE_URL={url}\n')
    f.write(f'NEXT_PUBLIC_SUPABASE_ANON_KEY={key}\n')

print(f'Written to {env_path}')
print(f'URL length: {len(url)}')
print(f'Key length: {len(key)}')
