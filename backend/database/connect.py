import os

from pymongo import MongoClient

# Override with an environment variable if your MongoDB is not on localhost,
# e.g. a free MongoDB Atlas cluster:
#   MONGO_URI="mongodb+srv://user:pass@cluster0.xxxxx.mongodb.net"
MONGO_URI = os.getenv("MONGO_URI", "mongodb://localhost:27017")
DB_NAME = os.getenv("MONGO_DB", "water_metro")

# serverSelectionTimeoutMS makes a missing/stopped MongoDB fail in 5s
# with a clear error instead of hanging for 30s.
client = MongoClient(MONGO_URI, serverSelectionTimeoutMS=5000)
db = client[DB_NAME]