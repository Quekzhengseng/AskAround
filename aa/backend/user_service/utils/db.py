# utils/db.py
import os
from supabase import create_client

# Initialize Supabase client
supabase_url = os.getenv("SUPABASE_URL")
supabase_key = os.getenv("SUPABASE_KEY")

if not supabase_url or not supabase_key:
    raise ValueError("Missing Supabase credentials")

supabase = create_client(supabase_url, supabase_key)
print("Supabase initialized for User Service!")

def get_user_by_id(user_id, select_fields="*"):
    """
    Retrieves a user by their ID
    
    Args:
        user_id (str): The user's unique identifier
        select_fields (str): Fields to select from the user record
        
    Returns:
        dict: User data if found, None otherwise
    """
    response = supabase.table('users').select(select_fields).eq('UID', user_id).execute()
    if response.data:
        return response.data[0]
    return None

def update_user(user_id, data):
    """
    Updates user data in the database
    
    Args:
        user_id (str): The user's unique identifier
        data (dict): Data to update
        
    Returns:
        dict: Updated user data
    """
    response = supabase.table('users').update(data).eq('UID', user_id).execute()
    return response.data