# test_load.py
from dotenv import load_dotenv
import os

print("Loading .env file...")
load_dotenv()

print("\nChecking environment variables:")
print(f"OPENAI_API_KEY: {'SET' if os.getenv('OPENAI_API_KEY') else 'NOT SET'}")
print(f"GEMINI_API_KEY: {'SET' if os.getenv('GEMINI_API_KEY') else 'NOT SET'}")
print(f"DATABASE_URL: {'SET' if os.getenv('DATABASE_URL') else 'NOT SET'}")
print(f"SECRET_KEY: {'SET' if os.getenv('SECRET_KEY') else 'NOT SET'}")

# Show values (masked)
print("\nValues (masked):")
for key in ['OPENAI_API_KEY', 'GEMINI_API_KEY', 'DATABASE_URL', 'SECRET_KEY']:
    value = os.getenv(key)
    if value:
        if 'KEY' in key and len(value) > 8:
            print(f"{key}: {value[:4]}...{value[-4:]}")
        else:
            print(f"{key}: {value[:20]}..." if len(value) > 20 else f"{key}: {value}")
    else:
        print(f"{key}: None")