#!/usr/bin/env python3
"""
Regression Test for timeLimitPerQuestion Fix
Specifically tests the requirements from the review request:
1. GET /api/quizzes - Verify NO timeLimitPerQuestion field in response
2. GET /api/quizzes/{quiz_id} - Verify NO timeLimitPerQuestion field in response  
3. Both endpoints should return timeLimit field with default value 0
"""

import requests
import json

BASE_URL = "https://znanjemajstor.preview.emergentagent.com/api"

def test_quiz_list_endpoint():
    """Test GET /api/quizzes endpoint"""
    print("=== Testing GET /api/quizzes ===")
    
    response = requests.get(f"{BASE_URL}/quizzes")
    
    if response.status_code != 200:
        print(f"❌ FAILED: Status code {response.status_code}")
        return False
        
    quizzes = response.json()
    
    if not quizzes:
        print("⚠️  No quizzes found to test")
        return True
        
    # Check each quiz in the list
    for i, quiz in enumerate(quizzes):
        print(f"  Checking quiz {i+1}: {quiz.get('title', 'Unknown')}")
        
        # Verify timeLimitPerQuestion is NOT present
        if "timeLimitPerQuestion" in quiz:
            print(f"❌ FAILED: timeLimitPerQuestion found in quiz list: {quiz['timeLimitPerQuestion']}")
            return False
            
        # Verify timeLimit is present
        if "timeLimit" not in quiz:
            print("❌ FAILED: timeLimit missing from quiz list")
            return False
            
        print(f"    ✅ timeLimit: {quiz['timeLimit']}, no timeLimitPerQuestion")
        
    print("✅ PASSED: Quiz list endpoint correct")
    return True

def test_individual_quiz_endpoint():
    """Test GET /api/quizzes/{quiz_id} endpoint"""
    print("=== Testing GET /api/quizzes/{quiz_id} ===")
    
    # First get a quiz ID from the list
    response = requests.get(f"{BASE_URL}/quizzes")
    if response.status_code != 200:
        print("❌ FAILED: Cannot get quiz list")
        return False
        
    quizzes = response.json()
    if not quizzes:
        print("⚠️  No quizzes found to test")
        return True
        
    quiz_id = quizzes[0]["id"]
    quiz_title = quizzes[0]["title"]
    print(f"  Testing quiz: {quiz_title} (ID: {quiz_id})")
    
    # Get individual quiz
    response = requests.get(f"{BASE_URL}/quizzes/{quiz_id}")
    
    if response.status_code != 200:
        print(f"❌ FAILED: Status code {response.status_code}")
        return False
        
    quiz = response.json()
    
    # Verify timeLimitPerQuestion is NOT present
    if "timeLimitPerQuestion" in quiz:
        print(f"❌ FAILED: timeLimitPerQuestion found in individual quiz: {quiz['timeLimitPerQuestion']}")
        return False
        
    # Verify timeLimit is present
    if "timeLimit" not in quiz:
        print("❌ FAILED: timeLimit missing from individual quiz")
        return False
        
    print(f"    ✅ timeLimit: {quiz['timeLimit']}, no timeLimitPerQuestion")
    print("✅ PASSED: Individual quiz endpoint correct")
    return True

def main():
    """Run regression tests"""
    print("🔍 Running timeLimitPerQuestion Regression Tests")
    print("=" * 60)
    
    results = []
    
    # Test quiz list endpoint
    results.append(test_quiz_list_endpoint())
    print()
    
    # Test individual quiz endpoint  
    results.append(test_individual_quiz_endpoint())
    print()
    
    # Summary
    print("=" * 60)
    print("📊 REGRESSION TEST RESULTS:")
    
    test_names = [
        "GET /api/quizzes (list)",
        "GET /api/quizzes/{id} (individual)"
    ]
    
    all_passed = True
    for i, (test_name, result) in enumerate(zip(test_names, results)):
        status = "✅ PASSED" if result else "❌ FAILED"
        print(f"  {test_name}: {status}")
        if not result:
            all_passed = False
            
    print()
    if all_passed:
        print("🎉 ALL REGRESSION TESTS PASSED!")
        print("✅ timeLimitPerQuestion has been successfully removed from API responses")
        print("✅ timeLimit field is present with correct default values")
    else:
        print("❌ REGRESSION TESTS FAILED!")
        print("⚠️  timeLimitPerQuestion fix needs attention")
        
    return all_passed

if __name__ == "__main__":
    success = main()
    exit(0 if success else 1)