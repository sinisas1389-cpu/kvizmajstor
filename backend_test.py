#!/usr/bin/env python3
"""
KvizMajstor Backend API Test Suite
Tests the recent changes to Quiz API endpoints focusing on:
1. timeLimitPerQuestion removal
2. timeLimit default behavior
3. Quiz CRUD operations
4. Quiz submission functionality
"""

import requests
import json
import uuid
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://znanjemajstor.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

class KvizMajstorTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.headers = HEADERS.copy()
        self.auth_token = None
        self.test_user_id = None
        self.test_quiz_id = None
        self.test_category_id = None
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages with formatting"""
        print(f"[{level}] {message}")
        
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    auth_required: bool = False) -> requests.Response:
        """Make HTTP request with proper headers and authentication"""
        url = f"{self.base_url}{endpoint}"
        headers = self.headers.copy()
        
        if auth_required and self.auth_token:
            headers["Authorization"] = f"Bearer {self.auth_token}"
            
        try:
            if method.upper() == "GET":
                response = requests.get(url, headers=headers, timeout=30)
            elif method.upper() == "POST":
                response = requests.post(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "PUT":
                response = requests.put(url, headers=headers, json=data, timeout=30)
            elif method.upper() == "DELETE":
                response = requests.delete(url, headers=headers, timeout=30)
            else:
                raise ValueError(f"Unsupported HTTP method: {method}")
                
            self.log(f"{method} {endpoint} -> {response.status_code}")
            return response
            
        except requests.exceptions.RequestException as e:
            self.log(f"Request failed: {e}", "ERROR")
            raise
            
    def setup_test_user(self) -> bool:
        """Create or login test user with Creator privileges"""
        self.log("=== Setting up test user ===")
        
        # Try to create a new user first
        test_email = f"testcreator_{uuid.uuid4().hex[:8]}@kvizmajstor.com"
        test_username = f"TestCreator_{uuid.uuid4().hex[:6]}"
        
        user_data = {
            "email": test_email,
            "username": test_username,
            "password": "testpassword123"
        }
        
        # Try signup first
        response = self.make_request("POST", "/auth/signup", user_data)
        
        if response.status_code == 201 or response.status_code == 200:
            data = response.json()
            self.auth_token = data.get("token")
            self.test_user_id = data.get("user", {}).get("id")
            self.log(f"✅ Created new test user: {test_username}")
            
            # Check if user has creator privileges
            user_info = data.get("user", {})
            if not user_info.get("isCreator") and not user_info.get("isAdmin"):
                self.log("⚠️  User doesn't have Creator privileges - will test with regular user")
            
            return True
            
        # If signup fails, try with admin credentials
        self.log("Signup failed, trying admin login...")
        admin_data = {
            "email": "admin@kvizmajstor.com",
            "password": "password"
        }
        
        response = self.make_request("POST", "/auth/login", admin_data)
        if response.status_code == 200:
            data = response.json()
            self.auth_token = data.get("token")
            self.test_user_id = data.get("user", {}).get("id")
            self.log("✅ Logged in as admin user")
            return True
            
        self.log("❌ Failed to setup test user", "ERROR")
        return False
        
    def get_test_category(self) -> Optional[str]:
        """Get a category ID for testing"""
        self.log("=== Getting test category ===")
        
        response = self.make_request("GET", "/categories")
        if response.status_code == 200:
            categories = response.json()
            if categories:
                self.test_category_id = categories[0]["id"]
                self.log(f"✅ Using category: {categories[0]['name']}")
                return self.test_category_id
                
        self.log("❌ No categories found", "ERROR")
        return None
        
    def test_quiz_creation_without_time_limit(self) -> bool:
        """Test 1: Create quiz WITHOUT specifying timeLimit (should default to 0)"""
        self.log("=== Test 1: Quiz Creation WITHOUT timeLimit ===")
        
        quiz_data = {
            "title": "Test Quiz - No Time Limit",
            "description": "Testing default timeLimit behavior",
            "categoryId": self.test_category_id,
            # Note: NOT specifying timeLimit - should default to 0
            "questions": [
                {
                    "type": "multiple",
                    "question": "Koji je glavni grad Srbije?",
                    "options": ["Beograd", "Novi Sad", "Niš", "Kragujevac"],
                    "correctAnswer": "Beograd"
                },
                {
                    "type": "true-false",
                    "question": "Srbija je članica EU.",
                    "correctAnswer": False
                }
            ]
        }
        
        response = self.make_request("POST", "/quizzes", quiz_data, auth_required=True)
        
        if response.status_code in [200, 201]:
            data = response.json()
            self.test_quiz_id = data.get("id")
            
            # Verify timeLimit defaults to 0
            if data.get("timeLimit") == 0:
                self.log("✅ timeLimit correctly defaults to 0")
            else:
                self.log(f"❌ timeLimit should be 0, got: {data.get('timeLimit')}", "ERROR")
                return False
                
            # Verify timeLimitPerQuestion is NOT in response
            if "timeLimitPerQuestion" in data:
                self.log("❌ timeLimitPerQuestion should NOT be in response", "ERROR")
                return False
            else:
                self.log("✅ timeLimitPerQuestion correctly removed from response")
                
            self.log("✅ Quiz creation without timeLimit: PASSED")
            return True
        else:
            self.log(f"❌ Quiz creation failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_quiz_creation_with_time_limit(self) -> bool:
        """Test 2: Create quiz WITH timeLimit = 15"""
        self.log("=== Test 2: Quiz Creation WITH timeLimit = 15 ===")
        
        quiz_data = {
            "title": "Test Quiz - 15 Min Limit",
            "description": "Testing explicit timeLimit setting",
            "categoryId": self.test_category_id,
            "timeLimit": 15,  # Explicitly set to 15 minutes
            "questions": [
                {
                    "type": "multiple",
                    "question": "Koliko ima kontinenata?",
                    "options": ["5", "6", "7", "8"],
                    "correctAnswer": "7"
                },
                {
                    "type": "true-false",
                    "question": "Zemlja je ravna.",
                    "correctAnswer": False
                }
            ]
        }
        
        response = self.make_request("POST", "/quizzes", quiz_data, auth_required=True)
        
        if response.status_code in [200, 201]:
            data = response.json()
            
            # Verify timeLimit is set to 15
            if data.get("timeLimit") == 15:
                self.log("✅ timeLimit correctly set to 15")
            else:
                self.log(f"❌ timeLimit should be 15, got: {data.get('timeLimit')}", "ERROR")
                return False
                
            # Verify timeLimitPerQuestion is NOT in response
            if "timeLimitPerQuestion" in data:
                self.log("❌ timeLimitPerQuestion should NOT be in response", "ERROR")
                return False
            else:
                self.log("✅ timeLimitPerQuestion correctly removed from response")
                
            self.log("✅ Quiz creation with timeLimit: PASSED")
            return True
        else:
            self.log(f"❌ Quiz creation failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_quiz_retrieval(self) -> bool:
        """Test 3: Quiz Retrieval (GET /api/quizzes/{quiz_id})"""
        self.log("=== Test 3: Quiz Retrieval ===")
        
        if not self.test_quiz_id:
            self.log("❌ No test quiz ID available", "ERROR")
            return False
            
        response = self.make_request("GET", f"/quizzes/{self.test_quiz_id}")
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify response includes timeLimit
            if "timeLimit" in data:
                self.log(f"✅ timeLimit present in response: {data['timeLimit']}")
            else:
                self.log("❌ timeLimit missing from response", "ERROR")
                return False
                
            # Verify timeLimitPerQuestion is NOT in response
            if "timeLimitPerQuestion" in data:
                self.log("❌ timeLimitPerQuestion should NOT be in response", "ERROR")
                return False
            else:
                self.log("✅ timeLimitPerQuestion correctly removed from response")
                
            # Verify all required quiz fields are present
            required_fields = ["id", "title", "description", "categoryId", "questionCount", "questions"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                self.log(f"❌ Missing required fields: {missing_fields}", "ERROR")
                return False
            else:
                self.log("✅ All required quiz fields present")
                
            self.log("✅ Quiz retrieval: PASSED")
            return True
        else:
            self.log(f"❌ Quiz retrieval failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_quiz_questions(self) -> bool:
        """Test 4: Quiz Questions (GET /api/quizzes/{quiz_id}/questions)"""
        self.log("=== Test 4: Quiz Questions Retrieval ===")
        
        if not self.test_quiz_id:
            self.log("❌ No test quiz ID available", "ERROR")
            return False
            
        response = self.make_request("GET", f"/quizzes/{self.test_quiz_id}/questions")
        
        if response.status_code == 200:
            questions = response.json()
            
            if not questions:
                self.log("❌ No questions returned", "ERROR")
                return False
                
            # Verify questions don't include correctAnswer field (security)
            has_correct_answer = any("correctAnswer" in q for q in questions)
            if has_correct_answer:
                self.log("❌ Questions should NOT include correctAnswer field", "ERROR")
                return False
            else:
                self.log("✅ correctAnswer field correctly removed from questions")
                
            # Verify both Multiple Choice and True/False questions are present
            question_types = [q.get("type") for q in questions]
            has_multiple = "multiple" in question_types
            has_true_false = "true-false" in question_types
            
            if has_multiple and has_true_false:
                self.log("✅ Both Multiple Choice and True/False questions present")
            else:
                self.log(f"❌ Missing question types. Found: {question_types}", "ERROR")
                return False
                
            self.log("✅ Quiz questions retrieval: PASSED")
            return True
        else:
            self.log(f"❌ Quiz questions retrieval failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_quiz_submission(self) -> bool:
        """Test 5: Quiz Submission (POST /api/quizzes/{quiz_id}/submit)"""
        self.log("=== Test 5: Quiz Submission ===")
        
        if not self.test_quiz_id:
            self.log("❌ No test quiz ID available", "ERROR")
            return False
            
        # First get the questions to know their IDs
        response = self.make_request("GET", f"/quizzes/{self.test_quiz_id}")
        if response.status_code != 200:
            self.log("❌ Failed to get quiz for submission test", "ERROR")
            return False
            
        quiz_data = response.json()
        questions = quiz_data.get("questions", [])
        
        if not questions:
            self.log("❌ No questions found for submission test", "ERROR")
            return False
            
        # Create submission with mixed correct/incorrect answers
        submission_data = {
            "answers": []
        }
        
        for i, question in enumerate(questions):
            if question.get("type") == "multiple":
                # For multiple choice, use correct answer for first question, wrong for others
                if i == 0:
                    answer = question.get("correctAnswer", question.get("options", [""])[0])
                else:
                    # Use wrong answer
                    options = question.get("options", [])
                    correct = question.get("correctAnswer")
                    wrong_options = [opt for opt in options if opt != correct]
                    answer = wrong_options[0] if wrong_options else options[0]
            else:  # true-false
                # For true-false, use correct answer for first question, wrong for others
                if i == 0:
                    answer = question.get("correctAnswer", True)
                else:
                    answer = not question.get("correctAnswer", True)
                    
            submission_data["answers"].append({
                "questionId": question["id"],
                "answer": answer
            })
            
        response = self.make_request("POST", f"/quizzes/{self.test_quiz_id}/submit", 
                                   submission_data, auth_required=True)
        
        if response.status_code == 200:
            result = response.json()
            
            # Verify result response format
            required_fields = ["score", "correctCount", "totalQuestions", "passed"]
            missing_fields = [field for field in required_fields if field not in result]
            
            if missing_fields:
                self.log(f"❌ Missing result fields: {missing_fields}", "ERROR")
                return False
                
            # Verify score calculation makes sense
            score = result.get("score", 0)
            correct_count = result.get("correctCount", 0)
            total_questions = result.get("totalQuestions", 0)
            
            if total_questions != len(questions):
                self.log(f"❌ Total questions mismatch: expected {len(questions)}, got {total_questions}", "ERROR")
                return False
                
            expected_score = int((correct_count / total_questions) * 100) if total_questions > 0 else 0
            if score != expected_score:
                self.log(f"❌ Score calculation error: expected {expected_score}, got {score}", "ERROR")
                return False
                
            self.log(f"✅ Quiz submission successful: {correct_count}/{total_questions} correct, score: {score}%")
            self.log("✅ Quiz submission: PASSED")
            return True
        else:
            self.log(f"❌ Quiz submission failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_api_health(self) -> bool:
        """Test basic API connectivity"""
        self.log("=== Testing API Health ===")
        
        response = self.make_request("GET", "/")
        if response.status_code == 200:
            self.log("✅ API is accessible")
            return True
        else:
            self.log(f"❌ API health check failed: {response.status_code}", "ERROR")
            return False
            
    def get_existing_quiz(self) -> bool:
        """Get an existing quiz for testing"""
        self.log("=== Getting existing quiz for testing ===")
        
        response = self.make_request("GET", "/quizzes")
        if response.status_code == 200:
            quizzes = response.json()
            if quizzes:
                self.test_quiz_id = quizzes[0]["id"]
                self.log(f"✅ Using existing quiz: {quizzes[0]['title']} (ID: {self.test_quiz_id})")
                return True
                
        self.log("❌ No existing quizzes found", "ERROR")
        return False
        
    def test_quiz_list_response_format(self) -> bool:
        """Test that quiz list doesn't contain timeLimitPerQuestion"""
        self.log("=== Test: Quiz List Response Format ===")
        
        response = self.make_request("GET", "/quizzes")
        if response.status_code == 200:
            quizzes = response.json()
            
            if not quizzes:
                self.log("⚠️  No quizzes found to test")
                return True
                
            # Check each quiz in the list
            for quiz in quizzes:
                if "timeLimitPerQuestion" in quiz:
                    self.log(f"❌ timeLimitPerQuestion found in quiz list response: {quiz.get('timeLimitPerQuestion')}", "ERROR")
                    return False
                    
                if "timeLimit" not in quiz:
                    self.log("❌ timeLimit missing from quiz list response", "ERROR")
                    return False
                    
            self.log("✅ Quiz list response format correct - no timeLimitPerQuestion, timeLimit present")
            return True
        else:
            self.log(f"❌ Failed to get quiz list: {response.status_code} - {response.text}", "ERROR")
            return False

    def run_all_tests(self) -> Dict[str, bool]:
        """Run all tests and return results"""
        self.log("🚀 Starting KvizMajstor Backend Tests")
        self.log("=" * 50)
        
        results = {}
        
        # Test API health
        results["api_health"] = self.test_api_health()
        if not results["api_health"]:
            self.log("❌ API not accessible - stopping tests", "ERROR")
            return results
            
        # Test quiz list format (doesn't require auth)
        results["quiz_list_format"] = self.test_quiz_list_response_format()
        
        # Setup test user for authenticated tests
        auth_setup = self.setup_test_user()
        
        # Get existing quiz for testing
        quiz_available = self.get_existing_quiz()
        
        if auth_setup and quiz_available:
            # Run tests that require authentication and existing quiz
            results["quiz_retrieval"] = self.test_quiz_retrieval()
            results["quiz_questions"] = self.test_quiz_questions()
            results["quiz_submission"] = self.test_quiz_submission()
        else:
            self.log("⚠️  Skipping authenticated tests - no auth or no quiz available")
            results["quiz_retrieval"] = False
            results["quiz_questions"] = False
            results["quiz_submission"] = False
            
        # Try quiz creation tests if we have auth (even if they fail due to permissions)
        if auth_setup:
            # Get test category
            if self.get_test_category():
                results["quiz_creation_no_limit"] = self.test_quiz_creation_without_time_limit()
                results["quiz_creation_with_limit"] = self.test_quiz_creation_with_time_limit()
            else:
                results["quiz_creation_no_limit"] = False
                results["quiz_creation_with_limit"] = False
        else:
            results["quiz_creation_no_limit"] = False
            results["quiz_creation_with_limit"] = False
        
        # Summary
        self.log("=" * 50)
        self.log("🏁 Test Results Summary:")
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            self.log(f"  {test_name}: {status}")
            
        self.log(f"\nOverall: {passed}/{total} tests passed")
        
        if passed == total:
            self.log("🎉 All tests PASSED!")
        else:
            self.log("⚠️  Some tests FAILED - check logs above")
            
        return results

if __name__ == "__main__":
    tester = KvizMajstorTester()
    results = tester.run_all_tests()