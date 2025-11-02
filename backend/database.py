from motor.motor_asyncio import AsyncIOMotorClient
import os

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ.get('DB_NAME', 'kviz_db')]

# Collections
users_collection = db.users
categories_collection = db.categories
quizzes_collection = db.quizzes
results_collection = db.results

async def init_categories():
    """Inicijalizuj kategorije ako ne postoje"""
    count = await categories_collection.count_documents({})
    if count == 0:
        categories = [
            {"id": "1", "name": "Istorija", "icon": "📜", "color": "#FFE66D", "quizCount": 0},
            {"id": "2", "name": "Srpski Jezik", "icon": "📖", "color": "#C7CEEA", "quizCount": 0},
            {"id": "3", "name": "Geografija", "icon": "🌍", "color": "#95E1D3", "quizCount": 0},
            {"id": "4", "name": "Matematika", "icon": "🔢", "color": "#FF6B6B", "quizCount": 0},
            {"id": "5", "name": "Biologija", "icon": "🧬", "color": "#A8E6CF", "quizCount": 0},
            {"id": "6", "name": "Informatika", "icon": "💻", "color": "#FFDAB9", "quizCount": 0},
            {"id": "7", "name": "Fizika", "icon": "⚛️", "color": "#B4A7D6", "quizCount": 0},
            {"id": "8", "name": "Hemija", "icon": "🔬", "color": "#4ECDC4", "quizCount": 0}
        ]
        await categories_collection.insert_many(categories)
        print("✅ Kategorije inicijalizovane")

async def close_db_connection():
    client.close()