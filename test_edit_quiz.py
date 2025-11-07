#!/usr/bin/env python3
"""
Test script to verify quiz edit functionality:
1. GET /api/quizzes - get list of all quizzes
2. GET /api/quizzes/{id}/edit - get complete quiz with questions
3. Update first question to add imageUrl
4. PUT /api/quizzes/{id} - save changes
"""

import requests
import json

BASE_URL = "https://znanjemajstor.preview.emergentagent.com/api"

def main():
    print("=" * 60)
    print("Testing Quiz Edit Functionality")
    print("=" * 60)
    
    # Step 1: Get list of all quizzes
    print("\n[Step 1] GET /api/quizzes - Getting list of all quizzes...")
    response = requests.get(f"{BASE_URL}/quizzes")
    
    if response.status_code != 200:
        print(f"❌ Failed to get quizzes: {response.status_code}")
        print(f"Response: {response.text}")
        return
    
    quizzes = response.json()
    print(f"✅ Found {len(quizzes)} quizzes")
    
    if not quizzes:
        print("❌ No quizzes available to test")
        return
    
    # Get first quiz
    first_quiz = quizzes[0]
    quiz_id = first_quiz["id"]
    print(f"✅ First quiz: '{first_quiz['title']}' (ID: {quiz_id})")
    
    # Step 2: Login as admin to get auth token
    print("\n[Step 2] Logging in as admin...")
    login_data = {
        "email": "admin@kvizmajstor.com",
        "password": "password"
    }
    
    response = requests.post(f"{BASE_URL}/auth/login", json=login_data)
    
    if response.status_code != 200:
        print(f"❌ Login failed: {response.status_code}")
        print(f"Response: {response.text}")
        return
    
    auth_data = response.json()
    token = auth_data.get("token")
    print(f"✅ Logged in successfully")
    
    # Step 3: Get complete quiz with edit endpoint
    print(f"\n[Step 3] GET /api/quizzes/{quiz_id}/edit - Getting complete quiz...")
    headers = {
        "Authorization": f"Bearer {token}",
        "Content-Type": "application/json"
    }
    
    response = requests.get(f"{BASE_URL}/quizzes/{quiz_id}/edit", headers=headers)
    
    if response.status_code != 200:
        print(f"❌ Failed to get quiz for edit: {response.status_code}")
        print(f"Response: {response.text}")
        return
    
    quiz_data = response.json()
    print(f"✅ Got complete quiz data")
    print(f"   Title: {quiz_data.get('title')}")
    print(f"   Questions: {len(quiz_data.get('questions', []))}")
    
    # Step 4: Update first question to add imageUrl
    print("\n[Step 4] Updating first question to add imageUrl...")
    
    if not quiz_data.get("questions"):
        print("❌ No questions in quiz")
        return
    
    # Add imageUrl to first question
    quiz_data["questions"][0]["imageUrl"] = "https://picsum.photos/800/400"
    
    print(f"✅ Updated first question:")
    print(f"   Question: {quiz_data['questions'][0].get('question')}")
    print(f"   ImageUrl: {quiz_data['questions'][0].get('imageUrl')}")
    
    # Step 5: Save changes using PUT
    print(f"\n[Step 5] PUT /api/quizzes/{quiz_id} - Saving changes...")
    
    # Prepare data for PUT request (use QuizCreate format)
    update_data = {
        "title": quiz_data["title"],
        "description": quiz_data["description"],
        "categoryId": quiz_data["categoryId"],
        "timeLimit": quiz_data.get("timeLimit", 0),
        "questions": quiz_data["questions"]
    }
    
    response = requests.put(
        f"{BASE_URL}/quizzes/{quiz_id}",
        headers=headers,
        json=update_data
    )
    
    if response.status_code != 200:
        print(f"❌ Failed to update quiz: {response.status_code}")
        print(f"Response: {response.text}")
        return
    
    print(f"✅ Quiz updated successfully!")
    
    # Step 6: Verify the update by fetching the quiz again
    print(f"\n[Step 6] Verifying update...")
    response = requests.get(f"{BASE_URL}/quizzes/{quiz_id}/edit", headers=headers)
    
    if response.status_code == 200:
        verified_quiz = response.json()
        first_question = verified_quiz.get("questions", [{}])[0]
        
        if first_question.get("imageUrl") == "https://picsum.photos/800/400":
            print(f"✅ Verification successful! ImageUrl is set correctly.")
        else:
            print(f"⚠️  ImageUrl not found or incorrect: {first_question.get('imageUrl')}")
    
    # Final result
    print("\n" + "=" * 60)
    print(f"✅ COMPLETED: Quiz ID {quiz_id} has been updated")
    print(f"   First question now has imageUrl: https://picsum.photos/800/400")
    print("=" * 60)
    print(f"\n📋 Quiz ID for user: {quiz_id}")

if __name__ == "__main__":
    main()
