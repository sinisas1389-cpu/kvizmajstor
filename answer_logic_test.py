#!/usr/bin/env python3
"""
Answer Normalization Logic Test
Tests the answer comparison logic from server.py without requiring a real quiz.
This simulates the exact logic used in the POST /api/quizzes/{quiz_id}/submit endpoint.
"""

def normalize_answer_comparison(user_answer, correct_answer):
    """
    Simulate the exact answer normalization logic from server.py lines 290-305
    """
    # Convert both to string for comparison to handle boolean/string mismatch
    if isinstance(user_answer, bool):
        user_answer = str(user_answer).lower()
    if isinstance(correct_answer, bool):
        correct_answer = str(correct_answer).lower()
        
    # Also normalize string answers
    if isinstance(user_answer, str):
        user_answer = user_answer.lower()
    if isinstance(correct_answer, str):
        correct_answer = str(correct_answer).lower()
    
    return user_answer == correct_answer

def test_answer_normalization():
    """Test all possible answer normalization scenarios"""
    print("🚀 Testing Answer Normalization Logic")
    print("=" * 50)
    
    test_cases = [
        # Boolean vs Boolean
        (True, True, True, "Boolean True vs Boolean True"),
        (False, False, True, "Boolean False vs Boolean False"),
        (True, False, False, "Boolean True vs Boolean False"),
        (False, True, False, "Boolean False vs Boolean True"),
        
        # Boolean vs String
        (True, "true", True, "Boolean True vs String 'true'"),
        (True, "True", True, "Boolean True vs String 'True'"),
        (True, "TRUE", True, "Boolean True vs String 'TRUE'"),
        (False, "false", True, "Boolean False vs String 'false'"),
        (False, "False", True, "Boolean False vs String 'False'"),
        (False, "FALSE", True, "Boolean False vs String 'FALSE'"),
        (True, "false", False, "Boolean True vs String 'false'"),
        (False, "true", False, "Boolean False vs String 'true'"),
        
        # String vs Boolean
        ("true", True, True, "String 'true' vs Boolean True"),
        ("True", True, True, "String 'True' vs Boolean True"),
        ("TRUE", True, True, "String 'TRUE' vs Boolean True"),
        ("false", False, True, "String 'false' vs Boolean False"),
        ("False", False, True, "String 'False' vs Boolean False"),
        ("FALSE", False, True, "String 'FALSE' vs Boolean False"),
        ("true", False, False, "String 'true' vs Boolean False"),
        ("false", True, False, "String 'false' vs Boolean True"),
        
        # String vs String
        ("true", "true", True, "String 'true' vs String 'true'"),
        ("True", "true", True, "String 'True' vs String 'true'"),
        ("TRUE", "true", True, "String 'TRUE' vs String 'true'"),
        ("false", "false", True, "String 'false' vs String 'false'"),
        ("False", "false", True, "String 'False' vs String 'false'"),
        ("FALSE", "false", True, "String 'FALSE' vs String 'false'"),
        ("true", "false", False, "String 'true' vs String 'false'"),
        ("false", "true", False, "String 'false' vs String 'true'"),
        
        # Edge cases
        ("", "", True, "Empty string vs Empty string"),
        ("yes", "yes", True, "String 'yes' vs String 'yes'"),
        ("Yes", "yes", True, "String 'Yes' vs String 'yes'"),
        ("YES", "yes", True, "String 'YES' vs String 'yes'"),
    ]
    
    passed = 0
    failed = 0
    
    for user_answer, correct_answer, expected, description in test_cases:
        result = normalize_answer_comparison(user_answer, correct_answer)
        
        if result == expected:
            print(f"✅ PASS: {description}")
            passed += 1
        else:
            print(f"❌ FAIL: {description}")
            print(f"   User: {user_answer} ({type(user_answer).__name__})")
            print(f"   Correct: {correct_answer} ({type(correct_answer).__name__})")
            print(f"   Expected: {expected}, Got: {result}")
            failed += 1
    
    print("=" * 50)
    print(f"🏁 Test Results: {passed} passed, {failed} failed")
    
    if failed == 0:
        print("🎉 All answer normalization tests PASSED!")
        print("✅ The backend logic correctly handles:")
        print("   - Boolean true/false answers")
        print("   - String 'true'/'false' answers (any case)")
        print("   - Mixed boolean/string comparisons")
        return True
    else:
        print("⚠️  Some tests FAILED - answer normalization has issues")
        return False

def test_quiz_submission_simulation():
    """Simulate a complete quiz submission with mixed answer types"""
    print("\n🎯 Simulating Quiz Submission with Mixed Answer Types")
    print("=" * 50)
    
    # Simulate quiz questions with their correct answers
    questions = [
        {"id": "q1", "type": "true-false", "question": "Srbija je u Evropi.", "correctAnswer": True},
        {"id": "q2", "type": "true-false", "question": "Beograd je glavni grad Francuske.", "correctAnswer": False},
        {"id": "q3", "type": "multiple", "question": "Glavni grad Srbije?", "correctAnswer": "Beograd"}
    ]
    
    # Test scenarios
    scenarios = [
        {
            "name": "Boolean Answers",
            "answers": [
                {"questionId": "q1", "answer": True},
                {"questionId": "q2", "answer": False},
                {"questionId": "q3", "answer": "Beograd"}
            ]
        },
        {
            "name": "String Answers",
            "answers": [
                {"questionId": "q1", "answer": "true"},
                {"questionId": "q2", "answer": "false"},
                {"questionId": "q3", "answer": "Beograd"}
            ]
        },
        {
            "name": "Mixed Case String Answers",
            "answers": [
                {"questionId": "q1", "answer": "True"},
                {"questionId": "q2", "answer": "FALSE"},
                {"questionId": "q3", "answer": "Beograd"}
            ]
        },
        {
            "name": "Wrong Answers",
            "answers": [
                {"questionId": "q1", "answer": False},
                {"questionId": "q2", "answer": True},
                {"questionId": "q3", "answer": "Novi Sad"}
            ]
        }
    ]
    
    all_passed = True
    
    for scenario in scenarios:
        print(f"\n📝 Testing: {scenario['name']}")
        
        correct_count = 0
        total_questions = len(questions)
        
        for answer in scenario["answers"]:
            question = next((q for q in questions if q["id"] == answer["questionId"]), None)
            if question:
                user_answer = answer["answer"]
                correct_answer = question["correctAnswer"]
                
                is_correct = normalize_answer_comparison(user_answer, correct_answer)
                if is_correct:
                    correct_count += 1
                    
                print(f"   Q{question['id']}: {user_answer} vs {correct_answer} -> {'✅' if is_correct else '❌'}")
        
        score = int((correct_count / total_questions) * 100) if total_questions > 0 else 0
        expected_score = 100 if scenario["name"] != "Wrong Answers" else 0
        
        print(f"   Result: {correct_count}/{total_questions} correct, Score: {score}%")
        
        if scenario["name"] == "Wrong Answers":
            if score == 0:
                print(f"   ✅ Correctly identified all wrong answers")
            else:
                print(f"   ❌ Should have scored 0%, got {score}%")
                all_passed = False
        else:
            if score == 100:
                print(f"   ✅ Perfect score as expected")
            else:
                print(f"   ❌ Should have scored 100%, got {score}%")
                all_passed = False
    
    return all_passed

if __name__ == "__main__":
    # Test the normalization logic
    logic_test_passed = test_answer_normalization()
    
    # Test complete submission simulation
    submission_test_passed = test_quiz_submission_simulation()
    
    print("\n" + "=" * 50)
    print("🏆 FINAL RESULTS:")
    print(f"   Answer Normalization Logic: {'✅ PASSED' if logic_test_passed else '❌ FAILED'}")
    print(f"   Quiz Submission Simulation: {'✅ PASSED' if submission_test_passed else '❌ FAILED'}")
    
    if logic_test_passed and submission_test_passed:
        print("\n🎉 ALL TESTS PASSED!")
        print("✅ The answer comparison logic correctly handles:")
        print("   - Boolean true/false submissions")
        print("   - String 'true'/'false' submissions (any case)")
        print("   - Mixed answer type scenarios")
        print("   - Proper score calculation")
    else:
        print("\n⚠️  SOME TESTS FAILED!")
        print("❌ The answer comparison logic has issues that need to be addressed.")