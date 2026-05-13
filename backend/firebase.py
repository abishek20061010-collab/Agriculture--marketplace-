import os
import firebase_admin
from firebase_admin import credentials, firestore
from dotenv import load_dotenv

load_dotenv()

# Get the path to your service account key from the .env file
cred_path = os.getenv("FIREBASE_CREDENTIALS_PATH")

# Initialize the app with a service account, only if it hasn't been initialized already
if not firebase_admin._apps:
    try:
        if cred_path and os.path.exists(cred_path):
            cred = credentials.Certificate(cred_path)
            firebase_admin.initialize_app(cred)
            print("[SUCCESS] Firebase Admin SDK Initialized")
        else:
            print(f"[WARNING] Firebase credentials file not found at: {cred_path}")
    except Exception as e:
        print(f"[ERROR] Failed to initialize Firebase: {e}")

# Export Firebase database connection
db = firestore.client() if firebase_admin._apps else None
