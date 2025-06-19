from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import uuid
from mongodb_connection_manager import AnalyticsConnectionHolder
from validation_utils import (
    validate_required_fields,
    parse_timestamp,
    check_database_connection,
    format_timestamps_in_document,
    create_success_response,
    create_error_response
)

crashes_blueprint = Blueprint('crashes', __name__)


@crashes_blueprint.route('/crashes', methods=['POST'])
def log_crash():
    """Log a crash or error report from the app"""

    print("💥 Received crash report...")

    try:
        data = request.json
        db = AnalyticsConnectionHolder.get_db()

        # Database connection check
        is_connected, error_response = check_database_connection(db)
        if not is_connected:
            return error_response

        # Required field validation
        required_fields = ['package_name', 'error_type']
        is_valid, error_response = validate_required_fields(data, required_fields)
        if not is_valid:
            return error_response

        # Parse timestamp
        timestamp, error_response = parse_timestamp(data.get('timestamp'))
        if error_response:
            return error_response

        package_name = data['package_name']
        error_type = data['error_type']
        error_message = data.get('error_message', 'No message provided')

        # Check if this exact crash already exists (for grouping similar crashes)
        crashes_collection = db[f"{package_name}_crashes"]

        # Create a "signature" for similar crashes
        crash_signature = f"{error_type}:{error_message}"

        existing_crash = crashes_collection.find_one({"crash_signature": crash_signature})

        if existing_crash:
            # Increment count for existing crash type
            crashes_collection.update_one(
                {"crash_signature": crash_signature},
                {
                    "$inc": {"count": 1},
                    "$set": {
                        "last_seen": timestamp,
                        "updated_at": datetime.now()
                    },
                    "$push": {
                        "occurrences": {
                            "timestamp": timestamp,
                            "user_id": data.get('user_id'),
                            "session_id": data.get('session_id'),
                            "device_info": data.get('device_info', {})
                        }
                    }
                }
            )

            print(f"✅ Updated existing crash: {error_type} (Count: {existing_crash['count'] + 1})")

            return create_success_response(
                "Crash report updated successfully",
                {
                    "crash_id": existing_crash['_id'],
                    "action": "updated",
                    "count": existing_crash['count'] + 1
                }
            )

        else:
            # Create new crash document
            crash_doc = {
                "_id": str(uuid.uuid4()),
                "crash_signature": crash_signature,
                "error_type": error_type,
                "error_message": error_message,
                "stack_trace": data.get('stack_trace', ''),
                "count": 1,
                "first_seen": timestamp,
                "last_seen": timestamp,
                "device_info": data.get('device_info', {}),
                "occurrences": [
                    {
                        "timestamp": timestamp,
                        "user_id": data.get('user_id'),
                        "session_id": data.get('session_id'),
                        "device_info": data.get('device_info', {})
                    }
                ],
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }

            crashes_collection.insert_one(crash_doc)
            print(f"✅ Logged new crash: {error_type}")

            return create_success_response(
                "Crash report logged successfully",
                {
                    "crash_id": crash_doc['_id'],
                    "action": "created"
                },
                201
            )

    except Exception as e:
        return create_error_response(f"Failed to log crash: {str(e)}")


@crashes_blueprint.route('/crashes/<package_name>', methods=['GET'])
def get_crashes(package_name):
    """Get crash reports for a specific package"""

    print(f"💥 Getting crashes for package: {package_name}")

    try:
        db = AnalyticsConnectionHolder.get_db()

        # Database connection check
        is_connected, error_response = check_database_connection(db)
        if not is_connected:
            return error_response

        # Get query parameters
        limit = int(request.args.get('limit', 50))
        sort_by = request.args.get('sort_by', 'last_seen')  # 'last_seen', 'count', 'first_seen'

        # Get crashes from package-specific collection
        crashes_collection = db[f"{package_name}_crashes"]
        crashes = list(crashes_collection.find({})
                       .sort(sort_by, -1)
                       .limit(limit))

        # Convert timestamps to ISO format
        timestamp_fields = ['first_seen', 'last_seen', 'created_at', 'updated_at']
        for crash in crashes:
            format_timestamps_in_document(crash, timestamp_fields)

            # Also format timestamps in occurrences
            for occurrence in crash.get('occurrences', []):
                if 'timestamp' in occurrence:
                    occurrence['timestamp'] = occurrence['timestamp'].isoformat()

        return jsonify({
            "package_name": package_name,
            "crashes": crashes,
            "count": len(crashes)
        }), 200

    except Exception as e:
        return create_error_response(f"Failed to retrieve crashes: {str(e)}")


@crashes_blueprint.route('/crashes/<package_name>/stats', methods=['GET'])
def get_crash_stats(package_name):
    """Get crash statistics for dashboard"""

    print(f"📊 Generating crash statistics for: {package_name}")

    try:
        db = AnalyticsConnectionHolder.get_db()

        # Database connection check
        is_connected, error_response = check_database_connection(db)
        if not is_connected:
            return error_response

        crashes_collection = db[f"{package_name}_crashes"]

        # Get total crash types (unique crashes)
        total_crash_types = crashes_collection.count_documents({})

        # Get total crash occurrences (sum of all counts)
        total_crashes_pipeline = [
            {"$group": {"_id": None, "total": {"$sum": "$count"}}}
        ]
        total_crashes_result = list(crashes_collection.aggregate(total_crashes_pipeline))
        total_crashes = total_crashes_result[0]['total'] if total_crashes_result else 0

        # Calculate crash rate
        sessions_collection = db[f"{package_name}_sessions"]
        total_sessions = sessions_collection.count_documents({})

        if total_sessions > 0:
            crash_rate = (total_crashes / total_sessions) * 100
            crash_rate_formatted = f"{crash_rate:.2f}%"
        else:
            crash_rate_formatted = "0%"

        # Get top crashes (most frequent)
        top_crashes = list(crashes_collection.find({})
                           .sort("count", -1)
                           .limit(10))

        # Format for frontend display
        recent_crashes = []
        for crash in top_crashes:
            device_model = "Unknown"
            if crash.get('device_info') and crash['device_info'].get('model'):
                device_model = crash['device_info']['model']
            elif crash.get('occurrences') and len(crash['occurrences']) > 0:
                latest_occurrence = crash['occurrences'][-1]
                if latest_occurrence.get('device_info') and latest_occurrence['device_info'].get('model'):
                    device_model = latest_occurrence['device_info']['model']

            recent_crashes.append({
                "error": crash['error_type'],
                "message": crash.get('error_message', '')[:100],  # Truncate long messages
                "device": device_model,
                "count": crash['count'],
                "lastSeen": format_time_ago(crash['last_seen'])
            })

        # Get crashes by type
        crash_types = [
            {"name": crash['error_type'], "value": crash['count']}
            for crash in top_crashes[:5]  # Top 5 for chart
        ]

        # Get daily crash trends
        daily_crashes = get_daily_crash_counts(crashes_collection)

        return jsonify({
            "package_name": package_name,
            "total_crash_types": total_crash_types,
            "total_crashes": total_crashes,
            "crash_rate": crash_rate_formatted,
            "recent_crashes": recent_crashes,
            "crash_types": crash_types,
            "daily_crashes": daily_crashes
        }), 200

    except Exception as e:
        return create_error_response(f"Failed to get crash statistics: {str(e)}")


def format_time_ago(timestamp):
    """Convert timestamp to human-readable 'time ago' format"""
    if not timestamp:
        return "Unknown"

    now = datetime.now()
    diff = now - timestamp

    if diff.days > 0:
        return f"{diff.days} day{'s' if diff.days != 1 else ''} ago"
    elif diff.seconds > 3600:
        hours = diff.seconds // 3600
        return f"{hours} hour{'s' if hours != 1 else ''} ago"
    elif diff.seconds > 60:
        minutes = diff.seconds // 60
        return f"{minutes} minute{'s' if minutes != 1 else ''} ago"
    else:
        return "Just now"


def get_daily_crash_counts(crashes_collection):
    """Get daily crash counts for trend analysis"""

    # Count occurrences by day
    pipeline = [
        {"$unwind": "$occurrences"},
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$occurrences.timestamp"}},
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}},
        {"$limit": 30}  # Last 30 days
    ]

    results = list(crashes_collection.aggregate(pipeline))

    # Format for frontend charts
    daily_data = [
        {"date": item['_id'], "crashes": item['count']}
        for item in results
    ]

    return daily_data