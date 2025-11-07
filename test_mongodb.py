#!/usr/bin/env python3
"""
MongoDB Connection Test Script
Testira da li je MongoDB Atlas connection string ispravan
"""

import sys

# Test connection string
MONGO_URL = "mongodb+srv://kviz_admin:54WrzTEgW4nLC9SA@kvizmajstor.lelecwy.mongodb.net/kviz_db?retryWrites=true&w=majority&appName=KvizMajstor"

print("🧪 Testiram MongoDB konekciju...")
print("=" * 60)

try:
    from motor.motor_asyncio import AsyncIOMotorClient
    import asyncio
    
    async def test_connection():
        try:
            # Kreiraj klijent
            print("📡 Connecting to MongoDB...")
            client = AsyncIOMotorClient(MONGO_URL)
            
            # Testiraj konekciju
            print("🔍 Testing connection...")
            await client.admin.command('ping')
            
            # Dobij database
            db = client.kviz_db
            
            # Testiraj pristup kolekcijama
            collections = await db.list_collection_names()
            
            print("\n✅ MongoDB USPEŠNO POVEZAN!")
            print("=" * 60)
            print(f"📊 Database: kviz_db")
            print(f"📁 Broj kolekcija: {len(collections)}")
            if collections:
                print(f"📂 Kolekcije: {', '.join(collections)}")
            else:
                print("📂 Kolekcije: (nema još - biće kreirane pri prvoj upotrebi)")
            
            # Testiraj insert
            print("\n🧪 Testiram insert operaciju...")
            test_collection = db.test
            result = await test_collection.insert_one({"test": "connection_test"})
            print(f"✅ Insert uspešan! ID: {result.inserted_id}")
            
            # Obriši test dokument
            await test_collection.delete_one({"_id": result.inserted_id})
            print("🧹 Test dokument obrisan")
            
            print("\n" + "=" * 60)
            print("🎉 SVE JE ISPRAVNO! MongoDB je spreman za deployment!")
            print("=" * 60)
            
            client.close()
            return True
            
        except Exception as e:
            print("\n❌ GREŠKA PRI KONEKCIJI!")
            print("=" * 60)
            print(f"Error: {str(e)}")
            print("\n🔧 Proveri:")
            print("  1. Da li je password tačan?")
            print("  2. Da li ste dozvolili Network Access (0.0.0.0/0)?")
            print("  3. Da li je cluster aktivan?")
            print("=" * 60)
            return False
    
    # Pokreni test
    result = asyncio.run(test_connection())
    sys.exit(0 if result else 1)
    
except ImportError:
    print("\n⚠️  Motor library nije instaliran!")
    print("📦 Instaliram motor...")
    import subprocess
    subprocess.check_call([sys.executable, "-m", "pip", "install", "motor"])
    print("\n✅ Motor instaliran! Pokreni skriptu ponovo:")
    print("   python3 test_mongodb.py")
    sys.exit(1)
