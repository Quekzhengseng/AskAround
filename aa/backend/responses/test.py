# test.py
import unittest
import json
import uuid # Keep uuid import
import os
import time
from unittest.mock import patch

try:
    from app import app, supabase # Keep importing app
except ImportError:
    raise ImportError("Could not import 'app' and 'supabase' from app.py.")

# --- Configuration ---
EXISTING_UID = "0b211997-822d-4a87-a555-22fde1da75cc"
TEST_SURVEY_ID = "cc64dcfe-810b-45f8-94d8-06a60b189305" # Keep ID from logs
NUM_QUESTIONS = 6
SAMPLE_ANSWERS_PAYLOAD = [
    {"question_id": "q1", "response": "Placeholder Text Answer"},
    {"question_id": "q2", "response": "Option 1"},
    {"question_id": "q3", "response": 4},
    {"question_id": "q4", "response": True},
    {"question_id": "q5", "response": "placeholder@example.com"},
    {"question_id": "q6", "response": "2024-12-31"}
]
if len(SAMPLE_ANSWERS_PAYLOAD) != NUM_QUESTIONS:
     raise ValueError("SAMPLE_ANSWERS_PAYLOAD length does not match NUM_QUESTIONS")

# --- Test Helper Function (Copied from app.py) ---
def is_valid_uuid(uuid_to_test, version=4):
    """ Check if uuid_to_test is a valid UUID. """
    if not isinstance(uuid_to_test, str):
        return False
    try:
        uuid.UUID(uuid_to_test, version=version)
        return True
    except ValueError:
        return False

class ResponsesAPITestCase(unittest.TestCase):
    # ... (setUpClass, tearDownClass, do_cleanup remain the same) ...
    @classmethod
    def do_cleanup(cls, uid=EXISTING_UID):
        try:
            supabase.table('responses').delete().eq('survey_id_fk', TEST_SURVEY_ID).eq('UID_fk', uid).execute()
        except Exception as e: print(f"Cleanup failed: {e}")

    def setUp(self):
        app.config['TESTING'] = True
        # Patch the verify function *within the app module* where it's called
        self.patcher = patch('app._get_uid_from_token_via_auth_service')
        self.mock_verify = self.patcher.start()
        self.mock_verify.return_value = (EXISTING_UID, None) # Simulate success
        self.client = app.test_client()
        # print(f"\n--- Running test: {self._testMethodName} ---") # Optional print
        self.do_cleanup()

    def tearDown(self):
        # print(f"\n--- Finished test: {self._testMethodName} ---") # Optional print
        self.do_cleanup()
        self.patcher.stop()


    # --- Test Cases ---

    def test_01_create_response_success_authenticated(self):
        # ... (same test logic) ...
        payload = {"survey_id": TEST_SURVEY_ID,"UID": EXISTING_UID,"answers": SAMPLE_ANSWERS_PAYLOAD}
        headers = {'Authorization': 'Bearer dummy'}
        response = self.client.post('/responses',data=json.dumps(payload),headers=headers, content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['UID'], EXISTING_UID)
        self.mock_verify.assert_called_once() # Verify mock was used


    def test_02_create_response_duplicate_authenticated(self):
       # ... (same test logic) ...
        payload = {"survey_id": TEST_SURVEY_ID,"UID": EXISTING_UID,"answers": SAMPLE_ANSWERS_PAYLOAD}
        headers = {'Authorization': 'Bearer dummy'}
        self.client.post('/responses', data=json.dumps(payload), headers=headers, content_type='application/json') # First post
        response = self.client.post('/responses', data=json.dumps(payload), headers=headers, content_type='application/json') # Second post
        self.assertEqual(response.status_code, 409)


    def test_03_create_response_success_guest(self):
       # ... (same test logic, corrected is_valid_uuid call) ...
        payload = {"survey_id": TEST_SURVEY_ID,"UID": "","answers": SAMPLE_ANSWERS_PAYLOAD}
        response = self.client.post('/responses', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 201)
        data = response.get_json()
        self.assertTrue(data['success'])
        generated_uid = data['data'].get('UID')
        self.assertTrue(is_valid_uuid(generated_uid), f"Generated UID '{generated_uid}' is not valid format") # Use local helper
        self.do_cleanup(uid=generated_uid) # Clean up guest response


    def test_04_create_response_fail_uid_without_token(self):
        # ... (same test logic) ...
        payload = {"survey_id": TEST_SURVEY_ID, "UID": EXISTING_UID, "answers": SAMPLE_ANSWERS_PAYLOAD }
        response = self.client.post('/responses', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response.status_code, 401)


    def test_05_get_responses_by_survey_success(self):
        # ... (same test logic - assumes GET requires no auth yet) ...
        payload = {"survey_id": TEST_SURVEY_ID, "UID": EXISTING_UID, "answers": SAMPLE_ANSWERS_PAYLOAD}
        headers = {'Authorization': 'Bearer dummy'}
        self.client.post('/responses', data=json.dumps(payload), headers=headers, content_type='application/json')
        response = self.client.get(f'/responses/survey/{TEST_SURVEY_ID}') # No headers for GET yet
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        found = any(item.get('survey_id_fk') == TEST_SURVEY_ID and item.get('UID_fk') == EXISTING_UID for item in data['data'])
        self.assertTrue(found)


    def test_06_get_all_responses_success(self):
        # ... (same test logic - assumes GET requires no auth yet) ...
        payload = {"survey_id": TEST_SURVEY_ID, "UID": EXISTING_UID, "answers": SAMPLE_ANSWERS_PAYLOAD}
        headers = {'Authorization': 'Bearer dummy'}
        self.client.post('/responses', data=json.dumps(payload), headers=headers, content_type='application/json')
        response = self.client.get('/responses') # No headers for GET yet
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        found = any(item.get('survey_id_fk') == TEST_SURVEY_ID and item.get('UID_fk') == EXISTING_UID for item in data['data'])
        self.assertTrue(found)


    def test_07_delete_response_success(self):
        # ... (same test logic) ...
        payload = {"survey_id": TEST_SURVEY_ID, "UID": EXISTING_UID, "answers": SAMPLE_ANSWERS_PAYLOAD}
        headers = {'Authorization': 'Bearer dummy'}
        self.client.post('/responses', data=json.dumps(payload), headers=headers, content_type='application/json')
        delete_response = self.client.delete(f'/responses/survey/{TEST_SURVEY_ID}/user/{EXISTING_UID}', headers=headers) # Pass headers
        self.assertEqual(delete_response.status_code, 200)


    def test_08_delete_response_forbidden(self):
       # ... (same test logic) ...
        payload = {"survey_id": TEST_SURVEY_ID, "UID": EXISTING_UID, "answers": SAMPLE_ANSWERS_PAYLOAD}
        headers_owner = {'Authorization': 'Bearer owner'}
        self.client.post('/responses', data=json.dumps(payload), headers=headers_owner, content_type='application/json')
        different_uid = str(uuid.uuid4())
        headers_attacker = {'Authorization': 'Bearer attacker'} # Mock returns EXISTING_UID
        delete_response = self.client.delete(f'/responses/survey/{TEST_SURVEY_ID}/user/{different_uid}', headers=headers_attacker)
        self.assertEqual(delete_response.status_code, 403) # Should now be 403


    def test_09_get_responses_by_survey_after_delete(self):
        # ... (same test logic) ...
        headers = {'Authorization': 'Bearer dummy'}
        self.client.delete(f'/responses/survey/{TEST_SURVEY_ID}/user/{EXISTING_UID}', headers=headers) # Pass headers
        response = self.client.get(f'/responses/survey/{TEST_SURVEY_ID}')
        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        found = any(item.get('survey_id_fk') == TEST_SURVEY_ID and item.get('UID_fk') == EXISTING_UID for item in data['data'])
        self.assertFalse(found)


    def test_10_delete_response_not_found(self):
       # ... (same test logic) ...
        headers = {'Authorization': 'Bearer dummy'}
        self.client.delete(f'/responses/survey/{TEST_SURVEY_ID}/user/{EXISTING_UID}', headers=headers)
        response = self.client.delete(f'/responses/survey/{TEST_SURVEY_ID}/user/{EXISTING_UID}', headers=headers)
        self.assertEqual(response.status_code, 200)


if __name__ == '__main__':
    unittest.main()