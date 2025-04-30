import unittest
import json
import uuid
import os
import time # Import time for potential sleep


try:
    from app import app, supabase
except ImportError:
    raise ImportError("Could not import 'app' and 'supabase' from app.py.")

# --- Configuration ---
EXISTING_UID = "0b211997-822d-4a87-a555-22fde1da75cc"
TEST_SURVEY_ID = "82113d31-0fcd-459a-beab-5dd2d4e00175"
NUM_QUESTIONS = 6
SAMPLE_ANSWERS = [
    "Placeholder Text Answer", "Option 1", 4, True,
    "placeholder@example.com", "2024-12-31"
]
if len(SAMPLE_ANSWERS) != NUM_QUESTIONS:
     raise ValueError("SAMPLE_ANSWERS length does not match NUM_QUESTIONS")


class ResponsesAPITestCase(unittest.TestCase):
    """Test suite for the Responses API endpoints."""

    @classmethod
    def do_cleanup(cls):
        """Helper method to delete the specific test record."""
        # print(f"\nAttempting cleanup for survey {TEST_SURVEY_ID}, user {EXISTING_UID}...")
        # try:
            # Use the global supabase client directly if accessible
        response = supabase.table('responses').delete()\
            .eq('survey_id_fk', TEST_SURVEY_ID)\
            .eq('UID_fk', EXISTING_UID)\
            .execute()
            # print("Cleanup successful or record didn't exist.")
        # except Exception as e:
            # print(f"Cleanup failed (this might be okay if table is empty): {e}")

    def setUp(self):
        """Runs before each test method. Ensures clean state."""
        app.config['TESTING'] = True # Ensure testing mode is set
        self.client = app.test_client() # Create client for each test
        print(f"\n--- Running test: {self._testMethodName} ---")
        self.do_cleanup() # Clean before test starts


    def tearDown(self):
        """Runs after each test method. Ensures clean state."""
        print(f"\n--- Finished test: {self._testMethodName} ---")
        self.do_cleanup() # Clean after test finishes


    # --- Test Cases ---

    def test_01_create_response_success(self):
        """Test POST /responses with valid existing UID."""
        payload = {
            "survey_id": TEST_SURVEY_ID, "UID": EXISTING_UID, "answers": SAMPLE_ANSWERS
        }
        response = self.client.post('/responses', data=json.dumps(payload), content_type='application/json')
        data = response.get_json()
        print(f"Response Status: {response.status_code}, Data: {data}")
        self.assertEqual(response.status_code, 201)
        self.assertTrue(data['success'])
        self.assertEqual(data['data']['UID'], EXISTING_UID)

    def test_02_create_response_duplicate(self):
        """Test POST /responses attempting duplicate (NEEDS DB CONSTRAINT)."""
        # Step 1: Create the response ensure it exists for the duplicate check
        payload = {"survey_id": TEST_SURVEY_ID, "UID": EXISTING_UID, "answers": SAMPLE_ANSWERS}
        response1 = self.client.post('/responses', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(response1.status_code, 201, "First post should succeed")

        # --- Optional: Add slight delay if suspecting timing issue ---
        # print("Pausing briefly before duplicate post...")
        # time.sleep(0.2)
        # --- End Optional Delay ---

        # Step 2: Attempt to create the duplicate
        response2 = self.client.post('/responses', data=json.dumps(payload), content_type='application/json')
        data = response2.get_json()
        print(f"Duplicate Response Status: {response2.status_code}, Data: {data}")

        # *** THIS WILL FAIL UNTIL YOU ADD/CONFIRM THE DB CONSTRAINT ***
        # (Or if there's a weird timing issue the delay above might fix)
        self.assertEqual(response2.status_code, 409, "Expected 409 Conflict - Requires/Confirm UNIQUE constraint on (survey_id_fk, UID_fk) in DB")
        if response2.status_code == 409: # Only check content if status is correct
            self.assertFalse(data['success'])
            self.assertIn('already exists', data['error'])

    def test_03_get_responses_by_survey_success(self):
        """Test GET /responses/survey/{survey_id} finds the created response."""
        # Step 1: Create the response to ensure it exists for this test
        payload = {"survey_id": TEST_SURVEY_ID, "UID": EXISTING_UID, "answers": SAMPLE_ANSWERS}
        create_response = self.client.post('/responses', data=json.dumps(payload), content_type='application/json') # Assume success or failure handled elsewhere
        self.assertEqual(create_response.status_code, 201, "Setup for get test failed: couldn't create response")


        # Step 2: Get responses for the survey
        response = self.client.get(f'/responses/survey/{TEST_SURVEY_ID}')
        data = response.get_json()
        print(f"GET Response Status: {response.status_code}")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIsInstance(data['data'], list)
        found = any(item.get('survey_id_fk') == TEST_SURVEY_ID and item.get('UID_fk') == EXISTING_UID for item in data['data'])
        self.assertTrue(found, f"Response for user {EXISTING_UID} and survey {TEST_SURVEY_ID} not found after creation")
        # Optional: Deeper check on answers
        for item in data['data']:
             if item.get('survey_id_fk') == TEST_SURVEY_ID and item.get('UID_fk') == EXISTING_UID:
                 self.assertEqual(item.get('answers'), SAMPLE_ANSWERS)
                 break

    def test_04_get_all_responses_success(self):
        """Test GET /responses retrieves at least the created response."""
         # Step 1: Create the response to ensure at least one exists
        payload = {"survey_id": TEST_SURVEY_ID, "UID": EXISTING_UID, "answers": SAMPLE_ANSWERS}
        create_response = self.client.post('/responses', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(create_response.status_code, 201, "Setup for get_all test failed: couldn't create response")


        # Step 2: Get all responses
        response = self.client.get('/responses')
        data = response.get_json()
        print(f"GET All Response Status: {response.status_code}")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIsInstance(data['data'], list)
        # Check if our specific record is present among all responses
        found = any(item.get('survey_id_fk') == TEST_SURVEY_ID and item.get('UID_fk') == EXISTING_UID for item in data['data'])
        self.assertTrue(found, f"Response for user {EXISTING_UID} / survey {TEST_SURVEY_ID} not found in GET /responses")


    def test_05_delete_response_success(self):
        """Test DELETE /responses/survey/{survey_id}/user/{uid} successfully."""
        # Step 1: Create the response to ensure it exists to be deleted
        payload = {"survey_id": TEST_SURVEY_ID, "UID": EXISTING_UID, "answers": SAMPLE_ANSWERS}
        create_response = self.client.post('/responses', data=json.dumps(payload), content_type='application/json')
        self.assertEqual(create_response.status_code, 201, "Setup for delete test failed: couldn't create response")

        # Step 2: Delete the response
        response = self.client.delete(f'/responses/survey/{TEST_SURVEY_ID}/user/{EXISTING_UID}')
        data = response.get_json()
        print(f"Delete Response Status: {response.status_code}, Data: {data}")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIn('Response deleted successfully', data['message'])

    def test_06_get_responses_by_survey_after_delete(self):
        """Test GET /responses/survey/{survey_id} after deletion to verify."""
        # Step 1: Ensure response does NOT exist (delete it just in case)
        self.client.delete(f'/responses/survey/{TEST_SURVEY_ID}/user/{EXISTING_UID}') # Run delete first

        # Step 2: Get responses for the survey
        response = self.client.get(f'/responses/survey/{TEST_SURVEY_ID}')
        data = response.get_json()
        print(f"GET After Delete Response Status: {response.status_code}")

        self.assertEqual(response.status_code, 200)
        self.assertTrue(data['success'])
        self.assertIsInstance(data['data'], list)
        found = any(item.get('survey_id_fk') == TEST_SURVEY_ID and item.get('UID_fk') == EXISTING_UID for item in data['data'])
        self.assertFalse(found, f"Response for user {EXISTING_UID} / survey {TEST_SURVEY_ID} should have been deleted")

    def test_07_delete_response_not_found(self):
        """Test DELETE for a non-existent/deleted response."""
         # Step 1: Ensure response does NOT exist
        self.client.delete(f'/responses/survey/{TEST_SURVEY_ID}/user/{EXISTING_UID}') # Run delete first

        # Step 2: Attempt to delete it again
        response = self.client.delete(f'/responses/survey/{TEST_SURVEY_ID}/user/{EXISTING_UID}')
        data = response.get_json()
        print(f"Delete Not Found Response Status: {response.status_code}, Data: {data}")

        self.assertEqual(response.status_code, 200) # API currently returns 200 OK
        self.assertTrue(data['success'])
        self.assertIn('Response deleted successfully', data['message'])


    # --- Test Case for Anonymous User (Commented Out - Needs User Schema Confirmed) ---
    # def test_create_response_anon_user(self):
    #     # ... (keep previous code for this test) ...
    #     pass

if __name__ == '__main__':
    unittest.main()