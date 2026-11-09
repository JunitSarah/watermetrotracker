from pymongo import MongoClient

# Connect to MongoDB running locally
client = MongoClient("mongodb://localhost:27017")

# Use the 'water_metro' database
db = client["water_metro"]

