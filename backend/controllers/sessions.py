from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
from mongodb_connection_manager import AnalyticsConnectionHolder
from session_cleanup import session_cleanup_service
from validation_utils import (
    validate_required_fields,
    parse_timestamp,
    check_database_connection,
    format_timestamps_in_document,
    create_success_response,
    create_error_response
)

sessions_blueprint = Blueprint('sessions', __name__)


@sessions_blueprint.route('/sessions', methods=['POST'])
def log_session():
    """Log a session start or end event"""

    print("🕐 Received session event...")

    try:
        data = request.json
        db = AnalyticsConnectionHolder.get_db()

        # Database connection check
        is_connected, error_response = check_database_connection(db)
        if not is_connected:
            return error_response

        # Required field validation
        required_fields = ['package_name', 'session_id', 'action']  # action = 'start' or 'end'
        is_valid, error_response = validate_required_fields(data, required_fields)
        if not is_valid:
            return error_response

        # Parse timestamp
        timestamp, error_response = parse_timestamp(data.get('timestamp'))
        if error_response:
            return error_response

        package_name = data['package_name']
        session_id = data['session_id']
        action = data['action']

        sessions_collection = db[f"{package_name}_sessions"]

        if action == 'start':
            # Create new session document
            session_doc = {
                "_id": str(uuid.uuid4()),
                "session_id": session_id,
                "user_id": data.get('user_id'),
                "start_time": timestamp,
                "end_time": None,
                "duration_seconds": None,
                "device_info": data.get('device_info', {}),
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }

            sessions_collection.insert_one(session_doc)
            print(f"✅ Session started: {session_id}")

            return create_success_response(
                "Session started successfully",
                {"session_id": session_id, "action": "started"},
                201
            )

        elif action == 'end':
            # Find existing session and update with end time
            existing_session = sessions_collection.find_one({"session_id": session_id})

            if not existing_session:
                return create_error_response("Session not found", 404)

            # Calculate duration
            start_time = existing_session['start_time']
            duration_seconds = int((timestamp - start_time).total_seconds())

            # Update session
            sessions_collection.update_one(
                {"session_id": session_id},
                {
                    "$set": {
                        "end_time": timestamp,
                        "duration_seconds": duration_seconds,
                        "updated_at": datetime.now()
                    }
                }
            )

            print(f"✅ Session ended: {session_id} (Duration: {duration_seconds}s)")

            return create_success_response(
                "Session ended successfully",
                {
                    "session_id": session_id,
                    "action": "ended",
                    "duration_seconds": duration_seconds
                }
            )

        else:
            return create_error_response("Invalid action. Must be 'start' or 'end'", 400)

    except Exception as e:
        return create_error_response(f"Failed to log session: {str(e)}")


@sessions_blueprint.route('/sessions/<package_name>', methods=['GET'])
def get_sessions(package_name):
    """Get sessions for a specific package"""

    print(f"📊 Getting sessions for package: {package_name}")

    try:
        db = AnalyticsConnectionHolder.get_db()

        # Database connection check
        is_connected, error_response = check_database_connection(db)
        if not is_connected:
            return error_response

        # Get query parameters
        limit = int(request.args.get('limit', 100))
        completed_only = request.args.get('completed_only', 'false').lower() == 'true'

        # Build query filter
        query_filter = {}
        if completed_only:
            query_filter['end_time'] = {"$ne": None}  # Only sessions that have ended

        # Get sessions from package-specific collection
        sessions_collection = db[f"{package_name}_sessions"]
        sessions = list(sessions_collection.find(query_filter)
                        .sort("start_time", -1)
                        .limit(limit))

        # Convert timestamps to ISO format
        timestamp_fields = ['start_time', 'end_time', 'created_at', 'updated_at']
        for session in sessions:
            format_timestamps_in_document(session, timestamp_fields)

        return jsonify({
            "package_name": package_name,
            "sessions": sessions,
            "count": len(sessions)
        }), 200

    except Exception as e:
        return create_error_response(f"Failed to retrieve sessions: {str(e)}")


@sessions_blueprint.route('/sessions/<package_name>/stats', methods=['GET'])
def get_session_stats(package_name):
    """Get session statistics for dashboard with automatic cleanup"""

    print(f"📈 Generating session statistics for: {package_name}")

    try:
        db = AnalyticsConnectionHolder.get_db()

        # Database connection check
        is_connected, error_response = check_database_connection(db)
        if not is_connected:
            return error_response

        # Run cleanup first to close any stale sessions
        print(f"🧹 Running session cleanup for {package_name}...")
        closed_sessions = session_cleanup_service.cleanup_stale_sessions(package_name)

        if closed_sessions > 0:
            print(f"✅ Cleanup completed: {closed_sessions} stale sessions auto-closed")

        sessions_collection = db[f"{package_name}_sessions"]

        # Get total session count
        total_sessions = sessions_collection.count_documents({})

        # Get completed sessions (have end_time)
        completed_sessions = sessions_collection.count_documents({"end_time": {"$ne": None}})

        # Calculate average session duration
        avg_duration_pipeline = [
            {"$match": {"duration_seconds": {"$ne": None}}},
            {"$group": {"_id": None, "avg_duration": {"$avg": "$duration_seconds"}}}
        ]
        avg_duration_result = list(sessions_collection.aggregate(avg_duration_pipeline))
        avg_duration_seconds = avg_duration_result[0]['avg_duration'] if avg_duration_result else 0

        avg_duration_formatted = format_duration(avg_duration_seconds)

        # Get session duration distribution (for pie chart)
        duration_distribution = get_duration_distribution(sessions_collection)

        # Get daily session counts (for line chart)
        daily_sessions = get_daily_session_counts(sessions_collection)

        # Get session completion rate
        completion_rate = (completed_sessions / total_sessions * 100) if total_sessions > 0 else 0

        return jsonify({
            "package_name": package_name,
            "total_sessions": total_sessions,
            "completed_sessions": completed_sessions,
            "completion_rate": f"{completion_rate:.1f}%",
            "average_session_duration": avg_duration_formatted,
            "average_duration_seconds": avg_duration_seconds,
            "session_duration_distribution": duration_distribution,
            "daily_sessions": daily_sessions,
            "cleanup_info": {
                "stale_sessions_closed": closed_sessions,
                "timeout_hours": session_cleanup_service.get_session_timeout_hours()
            }
        }), 200

    except Exception as e:
        return create_error_response(f"Failed to get session statistics: {str(e)}")

def format_duration(seconds):
    """Convert seconds to human-readable format (e.g., '5m 23s')"""
    if not seconds or seconds < 0:
        return "0s"

    hours = int(seconds // 3600)
    minutes = int((seconds % 3600) // 60)
    secs = int(seconds % 60)

    if hours > 0:
        return f"{hours}h {minutes}m {secs}s"
    elif minutes > 0:
        return f"{minutes}m {secs}s"
    else:
        return f"{secs}s"


def get_duration_distribution(sessions_collection):
    """Get distribution of session durations for pie chart"""

    pipeline = [
        {"$match": {"duration_seconds": {"$ne": None}}},
        {
            "$bucket": {
                "groupBy": "$duration_seconds",
                "boundaries": [0, 60, 300, 900, 1800, float('inf')],  # 0-1min, 1-5min, 5-15min, 15-30min, 30min+
                "default": "30min+",
                "output": {"count": {"$sum": 1}}
            }
        }
    ]

    results = list(sessions_collection.aggregate(pipeline))

    # Convert to frontend format
    labels = ["<1 min", "1-5 mins", "5-15 mins", "15-30 mins", ">30 mins"]
    distribution = []

    for i, result in enumerate(results):
        if i < len(labels):
            distribution.append({
                "name": labels[i],
                "value": result["count"]
            })

    return distribution


def get_daily_session_counts(sessions_collection):
    """Get daily session counts for line chart"""

    pipeline = [
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$start_time"}},
                "count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}},
        {"$limit": 30}  # Last 30 days
    ]

    results = list(sessions_collection.aggregate(pipeline))

    # Format for frontend charts
    daily_data = [
        {"date": item['_id'], "sessions": item['count']}
        for item in results
    ]

    return daily_data