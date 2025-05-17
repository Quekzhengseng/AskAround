# shared/shared/db.py
import os
from supabase import create_client
from flask import jsonify
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

class Database:
    def __init__(self):
        # Initialize Supabase
        self.supabase_url = os.getenv("SUPABASE_URL")
        self.supabase_key = os.getenv("SUPABASE_KEY")

        if not self.supabase_url or not self.supabase_key:
            raise ValueError("Missing Supabase credentials")

        self.supabase = create_client(self.supabase_url, self.supabase_key)
        print("Supabase initialized!")

    # Survey-related methods
    def get_all_surveys(self):
        """
        Retrieve all surveys from Supabase
        
        Returns:
            list: List of surveys
        """
        response = self.supabase.table("surveys").select("*").execute()
        if hasattr(response, 'error') and response.error:
            raise Exception(f"Error retrieving surveys: {response.error}")
        return response.data

    def get_survey_by_id(self, survey_id):
        """
        Retrieve a specific survey by ID
        
        Args:
            survey_id (str): The survey's unique identifier
            
        Returns:
            dict: Survey data if found, None otherwise
        """
        response = self.supabase.table("surveys").select("*").eq('survey_id', survey_id).execute()
        return response.data[0] if response.data else None

    # User-related methods
    def get_user_by_id(self, user_id, select_fields="*"):
        """
        Retrieves a user by their ID
        
        Args:
            user_id (str): The user's unique identifier
            select_fields (str): Fields to select from the user record
            
        Returns:
            dict: User data if found, None otherwise
        """
        response = self.supabase.table('users').select(select_fields).eq('UID', user_id).execute()
        if response.data:
            return response.data[0]
        return None

    def update_user(self, user_id, data):
        """
        Updates user data in the database
        
        Args:
            user_id (str): The user's unique identifier
            data (dict): Data to update
            
        Returns:
            dict: Updated user data
        """
        response = self.supabase.table('users').update(data).eq('UID', user_id).execute()
        return response.data
    
    # Response formatting utility
    def format_response(self, success, data=None, error=None, status_code=200):
        """
        Format response in a consistent way
        
        Args:
            success (bool): Whether the operation was successful
            data (any, optional): Data to return
            error (str, optional): Error message
            status_code (int, optional): HTTP status code
            
        Returns:
            tuple: (response_json, status_code)
        """
        response = {
            'success': success
        }
        
        if data is not None:
            response['data'] = data
            
        if error is not None:
            response['error'] = str(error)
            
        return jsonify(response), status_code
