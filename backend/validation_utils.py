"""
Shared validation utilities for Analytics API
Prevents code duplication across controllers
"""

from flask import jsonify
from datetime import datetime


def validate_required_fields(data, required_fields):
    """
    Check if all required fields are present in the request data

    Args:
        data (dict): The request JSON data
        required_fields (list): List of required field names

    Returns:
        tuple: (is_valid, error_response)
               is_valid is True if all fields present, False otherwise
               error_response is the JSON response to return if invalid
    """
    missing_fields = [field for field in required_fields if field not in data]

    if missing_fields:
        error_response = jsonify({
            "error": f"Missing required fields: {', '.join(missing_fields)}"
        }), 400
        return False, error_response

    return True, None


def parse_timestamp(timestamp_data):
    """
    Parse timestamp from various formats into datetime object

    Args:
        timestamp_data: Can be int/float (milliseconds), string (ISO), or None

    Returns:
        tuple: (datetime_object, error_response)
               datetime_object is the parsed datetime
               error_response is JSON response if parsing failed
    """
    if timestamp_data is None:
        return datetime.now(), None

    try:
        # Handle millisecond timestamps (from mobile apps)
        if isinstance(timestamp_data, (int, float)):
            return datetime.fromtimestamp(timestamp_data / 1000), None

        # Handle ISO string timestamps
        elif isinstance(timestamp_data, str):
            return datetime.fromisoformat(timestamp_data.replace('Z', '+00:00')), None

        else:
            error_response = jsonify({"error": "Invalid timestamp format"}), 400
            return None, error_response

    except (ValueError, TypeError) as e:
        error_response = jsonify({"error": f"Invalid timestamp format: {str(e)}"}), 400
        return None, error_response


def check_database_connection(db):
    """
    Check if database connection is available

    Args:
        db: Database connection object

    Returns:
        tuple: (is_connected, error_response)
               is_connected is True if DB is available, False otherwise
               error_response is JSON response to return if not connected
    """
    if db is None:
        error_response = jsonify({"error": "Could not connect to the database"}), 500
        return False, error_response

    return True, None


def format_timestamps_in_document(document, timestamp_fields):
    """
    Convert datetime objects to ISO format strings in a document

    Args:
        document (dict): The document to format
        timestamp_fields (list): List of field names that contain timestamps

    Returns:
        dict: The document with formatted timestamps
    """
    for field in timestamp_fields:
        if field in document and document[field]:
            document[field] = document[field].isoformat()

    return document


def create_success_response(message, data=None, status_code=200):
    """
    Create a standardized success response

    Args:
        message (str): Success message
        data (dict): Optional data to include
        status_code (int): HTTP status code

    Returns:
        tuple: (json_response, status_code)
    """
    response_data = {"message": message}
    if data:
        response_data.update(data)

    return jsonify(response_data), status_code


def create_error_response(error_message, status_code=500):
    """
    Create a standardized error response

    Args:
        error_message (str): Error message
        status_code (int): HTTP status code

    Returns:
        tuple: (json_response, status_code)
    """
    return jsonify({"error": error_message}), status_code