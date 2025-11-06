#!/usr/bin/env python3
"""
Answer Comparison Logic Test
Tests the POST /api/quizzes/{quiz_id}/submit endpoint answer normalization:
1. Boolean true/false answers
2. String "true"/"false" answers
3. Verifies both approaches work correctly
"""

import requests
import json
import uuid
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://znanjemajstor.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

class AnswerComparisonTester:
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
        """Create or login test user"""
        self.log("=== Setting up test user ===")
        
        # Try to create a new user first
        test_email = f"answertest_{uuid.uuid4().hex[:8]}@kvizmajstor.com"
        test_username = f"AnswerTest_{uuid.uuid4().hex[:6]}"
        
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
        
    def get_existing_quiz_with_true_false(self) -> Optional[str]:
        """Find an existing quiz that has True/False questions"""
        self.log("=== Finding quiz with True/False questions ===")
        
        response = self.make_request("GET", "/quizzes")
        if response.status_code != 200:
            self.log("❌ Failed to get quiz list", "ERROR")
            return None
            
        quizzes = response.json()
        
        for quiz in quizzes:
            # Get quiz details to check questions
            quiz_response = self.make_request("GET", f"/quizzes/{quiz['id']}")
            if quiz_response.status_code == 200:
                quiz_data = quiz_response.json()
                questions = quiz_data.get("questions", [])
                
                # Check if this quiz has True/False questions
                has_true_false = any(q.get("type") == "true-false" for q in questions)
                if has_true_false:
                    self.test_quiz_id = quiz["id"]
                    self.log(f"✅ Found quiz with True/False questions: {quiz['title']} (ID: {quiz['id']})")
                    return quiz["id"]
                    
        self.log("❌ No quiz with True/False questions found", "ERROR")
        return None
        
    def create_test_quiz_with_true_false(self) -> Optional[str]:
        """Create a test quiz with True/False questions"""
        self.log("=== Creating test quiz with True/False questions ===")
        
        # Get a category first
        response = self.make_request("GET", "/categories")
        if response.status_code != 200:
            self.log("❌ Failed to get categories", "ERROR")
            return None
            
        categories = response.json()
        if not categories:
            self.log("❌ No categories available", "ERROR")
            return None
            
        category_id = categories[0]["id"]
        
        quiz_data = {
            "title": "Answer Comparison Test Quiz",
            "description": "Test quiz for answer normalization",
            "categoryId": category_id,
            "timeLimit": 0,
            "questions": [
                {
                    "id": str(uuid.uuid4()),
                    "type": "true-false",
                    "question": "Srbija je u Evropi.",
                    "correctAnswer": True
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "true-false", 
                    "question": "Beograd je glavni grad Francuske.",
                    "correctAnswer": False
                },
                {
                    "id": str(uuid.uuid4()),
                    "type": "multiple",
                    "question": "Koji je glavni grad Srbije?",
                    "options": ["Beograd", "Novi Sad", "Niš", "Kragujevac"],
                    "correctAnswer": "Beograd"
                }
            ]
        }
        
        response = self.make_request("POST", "/quizzes", quiz_data, auth_required=True)
        
        if response.status_code in [200, 201]:
            data = response.json()
            quiz_id = data.get("id")
            self.test_quiz_id = quiz_id
            self.log(f"✅ Created test quiz: {quiz_id}")
            return quiz_id
        else:
            self.log(f"❌ Failed to create test quiz: {response.status_code} - {response.text}", "ERROR")
            return None
            
    def test_boolean_answers(self) -> bool:
        """Test 1: Submit with boolean true/false answers"""
        self.log("=== Test 1: Boolean true/false answers ===")
        
        if not self.test_quiz_id:
            self.log("❌ No test quiz available", "ERROR")
            return False
            
        # Get quiz questions
        response = self.make_request("GET", f"/quizzes/{self.test_quiz_id}")
        if response.status_code != 200:
            self.log("❌ Failed to get quiz data", "ERROR")
            return False
            
        quiz_data = response.json()
        questions = quiz_data.get("questions", [])
        
        # Create submission with boolean answers
        submission_data = {
            "answers": []
        }
        
        expected_correct = 0
        for question in questions:
            if question.get("type") == "true-false":
                # Use boolean values
                correct_answer = question.get("correctAnswer")
                submission_data["answers"].append({
                    "questionId": question["id"],
                    "answer": correct_answer  # Boolean value
                })
                expected_correct += 1
            elif question.get("type") == "multiple":
                # Use correct string answer for multiple choice
                correct_answer = question.get("correctAnswer")
                submission_data["answers"].append({
                    "questionId": question["id"],
                    "answer": correct_answer
                })
                expected_correct += 1
                
        self.log(f"Submitting with boolean answers: {json.dumps(submission_data, indent=2)}")
        
        response = self.make_request("POST", f"/quizzes/{self.test_quiz_id}/submit", 
                                   submission_data, auth_required=True)
        
        if response.status_code == 200:
            result = response.json()
            correct_count = result.get("correctCount", 0)
            total_questions = result.get("totalQuestions", 0)
            score = result.get("score", 0)
            
            self.log(f"Result: {correct_count}/{total_questions} correct, score: {score}%")
            
            if correct_count == expected_correct:
                self.log("✅ Boolean answers processed correctly")
                return True
            else:
                self.log(f"❌ Expected {expected_correct} correct, got {correct_count}", "ERROR")
                return False
        else:
            self.log(f"❌ Boolean submission failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_string_answers(self) -> bool:
        """Test 2: Submit with string "true"/"false" answers"""
        self.log("=== Test 2: String 'true'/'false' answers ===")
        
        if not self.test_quiz_id:
            self.log("❌ No test quiz available", "ERROR")
            return False
            
        # Get quiz questions
        response = self.make_request("GET", f"/quizzes/{self.test_quiz_id}")
        if response.status_code != 200:
            self.log("❌ Failed to get quiz data", "ERROR")
            return False
            
        quiz_data = response.json()
        questions = quiz_data.get("questions", [])
        
        # Create submission with string answers
        submission_data = {
            "answers": []
        }
        
        expected_correct = 0
        for question in questions:
            if question.get("type") == "true-false":
                # Convert boolean to string
                correct_answer = question.get("correctAnswer")
                string_answer = "true" if correct_answer else "false"
                submission_data["answers"].append({
                    "questionId": question["id"],
                    "answer": string_answer  # String value
                })
                expected_correct += 1
            elif question.get("type") == "multiple":
                # Use correct string answer for multiple choice
                correct_answer = question.get("correctAnswer")
                submission_data["answers"].append({
                    "questionId": question["id"],
                    "answer": correct_answer
                })
                expected_correct += 1
                
        self.log(f"Submitting with string answers: {json.dumps(submission_data, indent=2)}")
        
        response = self.make_request("POST", f"/quizzes/{self.test_quiz_id}/submit", 
                                   submission_data, auth_required=True)
        
        if response.status_code == 200:
            result = response.json()
            correct_count = result.get("correctCount", 0)
            total_questions = result.get("totalQuestions", 0)
            score = result.get("score", 0)
            
            self.log(f"Result: {correct_count}/{total_questions} correct, score: {score}%")
            
            if correct_count == expected_correct:
                self.log("✅ String answers processed correctly")
                return True
            else:
                self.log(f"❌ Expected {expected_correct} correct, got {correct_count}", "ERROR")
                return False
        else:
            self.log(f"❌ String submission failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_mixed_case_strings(self) -> bool:
        """Test 3: Submit with mixed case string answers"""
        self.log("=== Test 3: Mixed case string answers ===")
        
        if not self.test_quiz_id:
            self.log("❌ No test quiz available", "ERROR")
            return False
            
        # Get quiz questions
        response = self.make_request("GET", f"/quizzes/{self.test_quiz_id}")
        if response.status_code != 200:
            self.log("❌ Failed to get quiz data", "ERROR")
            return False
            
        quiz_data = response.json()
        questions = quiz_data.get("questions", [])
        
        # Create submission with mixed case string answers
        submission_data = {
            "answers": []
        }
        
        expected_correct = 0
        for i, question in enumerate(questions):
            if question.get("type") == "true-false":
                # Use mixed case strings
                correct_answer = question.get("correctAnswer")
                if i % 2 == 0:
                    string_answer = "True" if correct_answer else "False"  # Capitalized
                else:
                    string_answer = "TRUE" if correct_answer else "FALSE"  # Uppercase
                    
                submission_data["answers"].append({
                    "questionId": question["id"],
                    "answer": string_answer
                })
                expected_correct += 1
            elif question.get("type") == "multiple":
                # Use correct string answer for multiple choice
                correct_answer = question.get("correctAnswer")
                submission_data["answers"].append({
                    "questionId": question["id"],
                    "answer": correct_answer
                })
                expected_correct += 1
                
        self.log(f"Submitting with mixed case answers: {json.dumps(submission_data, indent=2)}")
        
        response = self.make_request("POST", f"/quizzes/{self.test_quiz_id}/submit", 
                                   submission_data, auth_required=True)
        
        if response.status_code == 200:
            result = response.json()
            correct_count = result.get("correctCount", 0)
            total_questions = result.get("totalQuestions", 0)
            score = result.get("score", 0)
            
            self.log(f"Result: {correct_count}/{total_questions} correct, score: {score}%")
            
            if correct_count == expected_correct:
                self.log("✅ Mixed case string answers processed correctly")
                return True
            else:
                self.log(f"❌ Expected {expected_correct} correct, got {correct_count}", "ERROR")
                return False
        else:
            self.log(f"❌ Mixed case submission failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def run_answer_comparison_tests(self) -> Dict[str, bool]:
        """Run all answer comparison tests"""
        self.log("🚀 Starting Answer Comparison Tests")
        self.log("=" * 50)
        
        results = {}
        
        # Setup test user
        auth_setup = self.setup_test_user()
        if not auth_setup:
            self.log("❌ Failed to setup test user - stopping tests", "ERROR")
            return {"setup_failed": False}
            
        # Try to find existing quiz with True/False questions
        quiz_id = self.get_existing_quiz_with_true_false()
        
        # If no existing quiz found, try to create one
        if not quiz_id:
            self.log("No existing quiz found, attempting to create test quiz...")
            quiz_id = self.create_test_quiz_with_true_false()
            
        if not quiz_id:
            self.log("❌ No quiz available for testing - stopping tests", "ERROR")
            return {"no_quiz": False}
            
        # Run the answer comparison tests
        results["boolean_answers"] = self.test_boolean_answers()
        results["string_answers"] = self.test_string_answers()
        results["mixed_case_strings"] = self.test_mixed_case_strings()
        
        # Summary
        self.log("=" * 50)
        self.log("🏁 Answer Comparison Test Results:")
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            self.log(f"  {test_name}: {status}")
            
        self.log(f"\nOverall: {passed}/{total} tests passed")
        
        if passed == total:
            self.log("🎉 All answer comparison tests PASSED!")
        else:
            self.log("⚠️  Some tests FAILED - check logs above")
            
        return results

if __name__ == "__main__":
    tester = AnswerComparisonTester()
    results = tester.run_answer_comparison_tests()