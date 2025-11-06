#!/usr/bin/env python3
"""
Full test for edit endpoint - creates a quiz and tests edit functionality
"""

import requests
import json
import uuid
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://znanjemajstor.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

class FullEditTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.headers = HEADERS.copy()
        self.creator_token = None
        self.creator_user_id = None
        self.test_quiz_id = None
        self.category_id = None
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages with formatting"""
        print(f"[{level}] {message}")
        
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    auth_token: str = None) -> requests.Response:
        """Make HTTP request with proper headers and authentication"""
        url = f"{self.base_url}{endpoint}"
        headers = self.headers.copy()
        
        if auth_token:
            headers["Authorization"] = f"Bearer {auth_token}"
            
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, headers=headers, json=data, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            self.log(f"{method} {endpoint} -> {response.status_code}")
            return response
            
        except requests.exceptions.RequestException as e:
            self.log(f"Request failed: {e}", "ERROR")
            raise
            
    def setup_creator_user(self) -> bool:
        """Try to create a user and make them a creator"""
        self.log("=== Setting up creator user ===")
        
        # Create user
        user_data = {
            "email": f"creator_{uuid.uuid4().hex[:8]}@test.com",
            "username": f"Creator_{uuid.uuid4().hex[:6]}",
            "password": "creator123"
        }
        
        response = self.make_request("POST", "/auth/signup", user_data)
        if response.status_code not in [200, 201]:
            self.log(f"❌ Failed to create user: {response.status_code}", "ERROR")
            return False
            
        data = response.json()
        self.creator_token = data.get("token")
        user = data.get("user", {})
        self.creator_user_id = user.get("id")
        
        self.log(f"Created user: {user.get('username')} (Admin: {user.get('isAdmin')}, Creator: {user.get('isCreator')})")
        
        # Check if user has creator privileges
        if user.get("isCreator") or user.get("isAdmin"):
            self.log("✅ User has creator/admin privileges")
            return True
        else:
            self.log("⚠️  User doesn't have creator privileges - will test anyway")
            return True  # Continue with test to see what happens
            
    def get_category(self) -> bool:
        """Get a category for quiz creation"""
        self.log("=== Getting category ===")
        
        response = self.make_request("GET", "/categories")
        if response.status_code == 200:
            categories = response.json()
            if categories:
                self.category_id = categories[0]["id"]
                self.log(f"✅ Using category: {categories[0]['name']}")
                return True
                
        self.log("❌ No categories found", "ERROR")
        return False
        
    def create_test_quiz(self) -> bool:
        """Create a test quiz"""
        self.log("=== Creating test quiz ===")
        
        quiz_data = {
            "title": f"Edit Test Quiz {uuid.uuid4().hex[:6]}",
            "description": "Quiz created for testing edit endpoint",
            "categoryId": self.category_id,
            "timeLimit": 10,
            "questions": [
                {
                    "id": str(uuid.uuid4()),
                    "type": "multiple",
                    "question": "Koji je glavni grad Srbije?",
                    "options": ["Beograd", "Novi Sad", "Niš", "Kragujevac"],
                    "correctAnswer": "Beograd"
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "true-false",
                    "question": "Srbija je članica EU.",
                    "correctAnswer": False
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "multiple",
                    "question": "Koliko kontinenata postoji?",
                    "options": ["5", "6", "7", "8"],
                    "correctAnswer": "7"
                }
            ]
        }
        
        response = self.make_request("POST", "/quizzes", quiz_data, auth_token=self.creator_token)
        
        if response.status_code in [200, 201]:
            data = response.json()
            self.test_quiz_id = data.get("id")
            self.log(f"✅ Created quiz: {data.get('title')} (ID: {self.test_quiz_id})")
            return True
        else:
            self.log(f"❌ Quiz creation failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_edit_endpoint_full_access(self) -> bool:
        """Test edit endpoint with creator access"""
        self.log("=== Test: Edit endpoint with creator access ===")
        
        if not self.test_quiz_id:
            self.log("❌ No test quiz available", "ERROR")
            return False
            
        response = self.make_request("GET", f"/quizzes/{self.test_quiz_id}/edit", 
                                   auth_token=self.creator_token)
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify quiz structure
            required_fields = ["id", "title", "description", "categoryId", "questions"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                self.log(f"❌ Missing required fields: {missing_fields}", "ERROR")
                return False
                
            # Verify questions have correctAnswer
            questions = data.get("questions", [])
            if not questions:
                self.log("❌ No questions in edit response", "ERROR")
                return False
                
            questions_with_correct = [q for q in questions if "correctAnswer" in q]
            if len(questions_with_correct) != len(questions):
                self.log(f"❌ Not all questions have correctAnswer. Expected: {len(questions)}, Got: {len(questions_with_correct)}", "ERROR")
                return False
                
            self.log(f"✅ Edit endpoint returned {len(questions)} questions with correctAnswer fields")
            
            # Verify specific question data
            for i, question in enumerate(questions):
                if "correctAnswer" not in question:
                    self.log(f"❌ Question {i+1} missing correctAnswer", "ERROR")
                    return False
                    
                correct_answer = question["correctAnswer"]
                self.log(f"  Question {i+1}: {question.get('question')[:50]}... -> {correct_answer}")
                
            self.log("✅ Edit endpoint with creator access: PASSED")
            return True
            
        elif response.status_code == 403:
            self.log("❌ Creator should have access to their own quiz", "ERROR")
            return False
        else:
            self.log(f"❌ Edit endpoint failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_compare_edit_vs_questions(self) -> bool:
        """Compare edit vs questions endpoint for the same quiz"""
        self.log("=== Test: Compare edit vs questions endpoint ===")
        
        if not self.test_quiz_id:
            self.log("❌ No test quiz available", "ERROR")
            return False
            
        # Get edit data
        edit_response = self.make_request("GET", f"/quizzes/{self.test_quiz_id}/edit", 
                                        auth_token=self.creator_token)
        
        # Get questions data
        questions_response = self.make_request("GET", f"/quizzes/{self.test_quiz_id}/questions")
        
        if edit_response.status_code != 200:
            self.log(f"❌ Edit endpoint failed: {edit_response.status_code}", "ERROR")
            return False
            
        if questions_response.status_code != 200:
            self.log(f"❌ Questions endpoint failed: {questions_response.status_code}", "ERROR")
            return False
            
        edit_data = edit_response.json()
        questions_data = questions_response.json()
        
        edit_questions = edit_data.get("questions", [])
        public_questions = questions_data
        
        # Compare question count
        if len(edit_questions) != len(public_questions):
            self.log(f"❌ Question count mismatch. Edit: {len(edit_questions)}, Questions: {len(public_questions)}", "ERROR")
            return False
            
        # Verify edit has correctAnswer, questions doesn't
        edit_with_correct = [q for q in edit_questions if "correctAnswer" in q]
        public_with_correct = [q for q in public_questions if "correctAnswer" in q]
        
        if len(edit_with_correct) != len(edit_questions):
            self.log("❌ Edit endpoint should have correctAnswer in all questions", "ERROR")
            return False
            
        if len(public_with_correct) > 0:
            self.log("❌ Questions endpoint should NOT have correctAnswer fields", "ERROR")
            return False
            
        self.log("✅ Edit endpoint has correctAnswer fields")
        self.log("✅ Questions endpoint does NOT have correctAnswer fields")
        self.log("✅ Endpoint comparison: PASSED")
        return True
        
    def run_full_test(self) -> Dict[str, bool]:
        """Run complete edit endpoint test"""
        self.log("🚀 Starting Full Edit Endpoint Test")
        self.log("=" * 60)
        
        results = {}
        
        # Setup
        results["user_setup"] = self.setup_creator_user()
        if not results["user_setup"]:
            return results
            
        results["category_setup"] = self.get_category()
        if not results["category_setup"]:
            return results
            
        results["quiz_creation"] = self.create_test_quiz()
        if not results["quiz_creation"]:
            return results
            
        # Main tests
        results["edit_access"] = self.test_edit_endpoint_full_access()
        results["endpoint_comparison"] = self.test_compare_edit_vs_questions()
        
        # Summary
        self.log("=" * 60)
        self.log("🏁 Full Edit Test Results:")
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            self.log(f"  {test_name}: {status}")
            
        self.log(f"\nOverall: {passed}/{total} tests passed")
        
        return results

if __name__ == "__main__":
    tester = FullEditTester()
    results = tester.run_full_test()