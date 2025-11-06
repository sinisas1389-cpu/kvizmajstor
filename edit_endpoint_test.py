#!/usr/bin/env python3
"""
Test for the new GET /api/quizzes/{quiz_id}/edit endpoint
Tests:
1. GET /api/quizzes/{quiz_id}/edit - returns quiz with all questions and correctAnswer fields
2. Authentication - only creator or admin can access
3. Compare with GET /api/quizzes/{quiz_id}/questions - edit has correctAnswer, questions does NOT
"""

import requests
import json
import uuid
from typing import Dict, Any, Optional

# Configuration
BASE_URL = "https://znanjemajstor.preview.emergentagent.com/api"
HEADERS = {"Content-Type": "application/json"}

class EditEndpointTester:
    def __init__(self):
        self.base_url = BASE_URL
        self.headers = HEADERS.copy()
        self.auth_token = None
        self.test_user_id = None
        self.test_quiz_id = None
        self.admin_token = None
        
    def log(self, message: str, level: str = "INFO"):
        """Log test messages with formatting"""
        print(f"[{level}] {message}")
        
    def make_request(self, method: str, endpoint: str, data: Optional[Dict] = None, 
                    auth_required: bool = False, token: str = None) -> requests.Response:
        """Make HTTP request with proper headers and authentication"""
        url = f"{self.base_url}{endpoint}"
        headers = self.headers.copy()
        
        if auth_required:
            auth_token = token or self.auth_token
            if auth_token:
                headers["Authorization"] = f"Bearer {auth_token}"
            
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
            
    def setup_admin_user(self) -> bool:
        """Login as admin user"""
        self.log("=== Setting up admin user ===")
        
        admin_data = {
            "email": "admin@kvizmajstor.com",
            "password": "password"
        }
        
        response = self.make_request("POST", "/auth/login", admin_data)
        if response.status_code == 200:
            data = response.json()
            self.admin_token = data.get("token")
            self.log("✅ Logged in as admin user")
            return True
        else:
            self.log(f"❌ Admin login failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def setup_regular_user(self) -> bool:
        """Create or login regular user (non-creator)"""
        self.log("=== Setting up regular user ===")
        
        # Try to create a new regular user
        test_email = f"testuser_{uuid.uuid4().hex[:8]}@kvizmajstor.com"
        test_username = f"TestUser_{uuid.uuid4().hex[:6]}"
        
        user_data = {
            "email": test_email,
            "username": test_username,
            "password": "testpassword123"
        }
        
        response = self.make_request("POST", "/auth/signup", user_data)
        
        if response.status_code in [200, 201]:
            data = response.json()
            self.auth_token = data.get("token")
            self.test_user_id = data.get("user", {}).get("id")
            self.log(f"✅ Created regular user: {test_username}")
            return True
        else:
            self.log(f"❌ Regular user creation failed: {response.status_code} - {response.text}", "ERROR")
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
        
    def test_edit_endpoint_with_admin(self) -> bool:
        """Test 1: GET /api/quizzes/{quiz_id}/edit with admin user"""
        self.log("=== Test 1: Edit endpoint with admin user ===")
        
        if not self.test_quiz_id:
            self.log("❌ No test quiz ID available", "ERROR")
            return False
            
        response = self.make_request("GET", f"/quizzes/{self.test_quiz_id}/edit", 
                                   auth_required=True, token=self.admin_token)
        
        if response.status_code == 200:
            data = response.json()
            
            # Verify quiz data structure
            required_fields = ["id", "title", "description", "categoryId", "questions"]
            missing_fields = [field for field in required_fields if field not in data]
            
            if missing_fields:
                self.log(f"❌ Missing required fields: {missing_fields}", "ERROR")
                return False
                
            # Verify questions have correctAnswer field
            questions = data.get("questions", [])
            if not questions:
                self.log("❌ No questions found in edit response", "ERROR")
                return False
                
            questions_with_correct_answer = [q for q in questions if "correctAnswer" in q]
            if len(questions_with_correct_answer) != len(questions):
                self.log(f"❌ Not all questions have correctAnswer field. Expected: {len(questions)}, Got: {len(questions_with_correct_answer)}", "ERROR")
                return False
                
            self.log(f"✅ All {len(questions)} questions have correctAnswer field")
            self.log("✅ Edit endpoint with admin: PASSED")
            return True
            
        elif response.status_code == 403:
            self.log("❌ Admin user should have access to edit endpoint", "ERROR")
            return False
        else:
            self.log(f"❌ Edit endpoint failed: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_edit_endpoint_with_regular_user(self) -> bool:
        """Test 2: GET /api/quizzes/{quiz_id}/edit with regular user (should fail)"""
        self.log("=== Test 2: Edit endpoint with regular user (should fail) ===")
        
        if not self.test_quiz_id:
            self.log("❌ No test quiz ID available", "ERROR")
            return False
            
        response = self.make_request("GET", f"/quizzes/{self.test_quiz_id}/edit", 
                                   auth_required=True, token=self.auth_token)
        
        if response.status_code == 403:
            self.log("✅ Regular user correctly denied access (403)")
            self.log("✅ Edit endpoint authentication: PASSED")
            return True
        elif response.status_code == 200:
            self.log("❌ Regular user should NOT have access to edit endpoint", "ERROR")
            return False
        else:
            self.log(f"❌ Unexpected response: {response.status_code} - {response.text}", "ERROR")
            return False
            
    def test_edit_endpoint_without_auth(self) -> bool:
        """Test 3: GET /api/quizzes/{quiz_id}/edit without authentication (should fail)"""
        self.log("=== Test 3: Edit endpoint without authentication (should fail) ===")
        
        if not self.test_quiz_id:
            self.log("❌ No test quiz ID available", "ERROR")
            return False
            
        response = self.make_request("GET", f"/quizzes/{self.test_quiz_id}/edit")
        
        if response.status_code == 401:
            self.log("✅ Unauthenticated request correctly denied (401)")
            self.log("✅ Edit endpoint requires authentication: PASSED")
            return True
        elif response.status_code == 422:
            self.log("✅ Unauthenticated request correctly denied (422 - validation error)")
            self.log("✅ Edit endpoint requires authentication: PASSED")
            return True
        else:
            self.log(f"❌ Unauthenticated request should be denied. Got: {response.status_code}", "ERROR")
            return False
            
    def test_compare_edit_vs_questions_endpoint(self) -> bool:
        """Test 4: Compare edit endpoint vs questions endpoint"""
        self.log("=== Test 4: Compare edit vs questions endpoint ===")
        
        if not self.test_quiz_id:
            self.log("❌ No test quiz ID available", "ERROR")
            return False
            
        # Get data from edit endpoint (with admin token)
        edit_response = self.make_request("GET", f"/quizzes/{self.test_quiz_id}/edit", 
                                        auth_required=True, token=self.admin_token)
        
        # Get data from questions endpoint (no auth required)
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
        
        if len(edit_questions) != len(public_questions):
            self.log(f"❌ Question count mismatch. Edit: {len(edit_questions)}, Questions: {len(public_questions)}", "ERROR")
            return False
            
        # Verify edit endpoint has correctAnswer fields
        edit_with_correct = [q for q in edit_questions if "correctAnswer" in q]
        if len(edit_with_correct) != len(edit_questions):
            self.log("❌ Edit endpoint should have correctAnswer in all questions", "ERROR")
            return False
            
        # Verify questions endpoint does NOT have correctAnswer fields
        public_with_correct = [q for q in public_questions if "correctAnswer" in q]
        if len(public_with_correct) > 0:
            self.log("❌ Questions endpoint should NOT have correctAnswer fields", "ERROR")
            return False
            
        self.log("✅ Edit endpoint has correctAnswer fields")
        self.log("✅ Questions endpoint does NOT have correctAnswer fields")
        self.log("✅ Endpoint comparison: PASSED")
        return True
        
    def test_edit_endpoint_nonexistent_quiz(self) -> bool:
        """Test 5: Edit endpoint with non-existent quiz ID"""
        self.log("=== Test 5: Edit endpoint with non-existent quiz ===")
        
        fake_quiz_id = str(uuid.uuid4())
        response = self.make_request("GET", f"/quizzes/{fake_quiz_id}/edit", 
                                   auth_required=True, token=self.admin_token)
        
        if response.status_code == 404:
            self.log("✅ Non-existent quiz correctly returns 404")
            self.log("✅ Edit endpoint error handling: PASSED")
            return True
        else:
            self.log(f"❌ Expected 404 for non-existent quiz, got: {response.status_code}", "ERROR")
            return False
            
    def run_all_tests(self) -> Dict[str, bool]:
        """Run all edit endpoint tests"""
        self.log("🚀 Starting Edit Endpoint Tests")
        self.log("=" * 50)
        
        results = {}
        
        # Setup users
        admin_setup = self.setup_admin_user()
        regular_setup = self.setup_regular_user()
        
        if not admin_setup:
            self.log("❌ Cannot proceed without admin user", "ERROR")
            return {"admin_setup": False}
            
        # Get existing quiz
        quiz_available = self.get_existing_quiz()
        if not quiz_available:
            self.log("❌ Cannot proceed without existing quiz", "ERROR")
            return {"quiz_setup": False}
            
        # Run tests
        results["edit_with_admin"] = self.test_edit_endpoint_with_admin()
        
        if regular_setup:
            results["edit_with_regular_user"] = self.test_edit_endpoint_with_regular_user()
        else:
            results["edit_with_regular_user"] = False
            
        results["edit_without_auth"] = self.test_edit_endpoint_without_auth()
        results["compare_endpoints"] = self.test_compare_edit_vs_questions_endpoint()
        results["edit_nonexistent_quiz"] = self.test_edit_endpoint_nonexistent_quiz()
        
        # Summary
        self.log("=" * 50)
        self.log("🏁 Edit Endpoint Test Results:")
        
        passed = sum(1 for result in results.values() if result)
        total = len(results)
        
        for test_name, result in results.items():
            status = "✅ PASSED" if result else "❌ FAILED"
            self.log(f"  {test_name}: {status}")
            
        self.log(f"\nOverall: {passed}/{total} tests passed")
        
        if passed == total:
            self.log("🎉 All edit endpoint tests PASSED!")
        else:
            self.log("⚠️  Some tests FAILED - check logs above")
            
        return results

if __name__ == "__main__":
    tester = EditEndpointTester()
    results = tester.run_all_tests()