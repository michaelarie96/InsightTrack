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
    """Get crash statistics with trend analysis"""

    print(f"📊 Generating enhanced crash statistics for: {package_name}")

    try:
        db = AnalyticsConnectionHolder.get_db()

        # Database connection check
        is_connected, error_response = check_database_connection(db)
        if not is_connected:
            return error_response

        crashes_collection = db[f"{package_name}_crashes"]
        sessions_collection = db[f"{package_name}_sessions"]

        total_crash_types = crashes_collection.count_documents({})

        # Get total crash occurrences
        total_crashes_pipeline = [
            {"$group": {"_id": None, "total": {"$sum": "$count"}}}
        ]
        total_crashes_result = list(crashes_collection.aggregate(total_crashes_pipeline))
        total_crashes = total_crashes_result[0]['total'] if total_crashes_result else 0

        # Calculate crash rate vs sessions
        total_sessions = sessions_collection.count_documents({})
        crash_rate = calculate_crash_rate(total_crashes, total_sessions)

        # Enhanced analytics
        daily_crash_trends = get_daily_crash_trends(crashes_collection)
        crash_rate_trends = get_crash_rate_trends(crashes_collection, sessions_collection)
        device_crash_patterns = get_device_crash_patterns(crashes_collection)
        top_crashes_by_impact = get_top_crashes_by_impact(crashes_collection)

        recent_crashes = get_recent_crashes_formatted(crashes_collection)

        return jsonify({
            "package_name": package_name,
            "total_crash_types": total_crash_types,
            "total_crashes": total_crashes,
            "crash_rate": crash_rate,
            "daily_crash_trends": daily_crash_trends,
            "crash_rate_trends": crash_rate_trends,
            "device_crash_patterns": device_crash_patterns,
            "top_crashes_by_impact": top_crashes_by_impact,
            "recent_crashes": recent_crashes
        }), 200

    except Exception as e:
        return create_error_response(f"Failed to get crash statistics: {str(e)}")


def calculate_crash_rate(total_crashes, total_sessions):
    """Calculate crash rate as percentage"""
    if total_sessions > 0:
        rate = (total_crashes / total_sessions) * 100
        return f"{rate:.2f}%"
    else:
        return "0%"


def get_daily_crash_trends(crashes_collection):
    """
    Get daily crash trends over the last 30 days INCLUDING TODAY
    """

    # Count crash occurrences by day using the occurrences array
    pipeline = [
        {"$unwind": "$occurrences"},
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$occurrences.timestamp"}},
                "crash_count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}}
    ]

    results = list(crashes_collection.aggregate(pipeline))

    # Convert to dictionary for easy lookup
    crash_counts_by_date = {item['_id']: item['crash_count'] for item in results}

    # Fill in ALL days from 29 days ago to today
    trend_data = []
    for i in range(29, -1, -1):
        date = datetime.now() - timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")

        # Get crash count for this date (0 if no crashes)
        crash_count = crash_counts_by_date.get(date_str, 0)

        trend_data.append({
            "date": date_str,
            "crashes": crash_count
        })

    print(
        f"📈 Daily crash trends calculated for {len(trend_data)} days (including today: {datetime.now().strftime('%Y-%m-%d')})")
    return trend_data


def get_crash_rate_trends(crashes_collection, sessions_collection):
    """
    Calculate crash rate trends over time

    This shows crash rate percentage per day

    Helps identify if app stability is improving or declining
    """

    # Get daily session counts
    session_pipeline = [
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$start_time"}},
                "session_count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}},
        {"$limit": 30}
    ]

    daily_sessions = {item['_id']: item['session_count']
                      for item in sessions_collection.aggregate(session_pipeline)}

    # Get daily crash counts
    crash_pipeline = [
        {"$unwind": "$occurrences"},
        {
            "$group": {
                "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$occurrences.timestamp"}},
                "crash_count": {"$sum": 1}
            }
        },
        {"$sort": {"_id": 1}},
        {"$limit": 30}
    ]

    daily_crashes = {item['_id']: item['crash_count']
                     for item in crashes_collection.aggregate(crash_pipeline)}

    # Calculate crash rate for each day
    rate_trends = []
    for i in range(30, 0, -1):
        date = datetime.now() - timedelta(days=i)
        date_str = date.strftime("%Y-%m-%d")

        crashes = daily_crashes.get(date_str, 0)
        sessions = daily_sessions.get(date_str, 0)

        crash_rate = (crashes / sessions * 100) if sessions > 0 else 0

        rate_trends.append({
            "date": date_str,
            "crash_rate": round(crash_rate, 2)
        })

    print(f"📊 Crash rate trends calculated for {len(rate_trends)} days")
    return rate_trends


def get_device_crash_patterns(crashes_collection):
    """
    Analyze which devices/OS versions crash most

    This helps identify problematic device configurations
    """

    # Crashes by device model
    device_pipeline = [
        {"$unwind": "$occurrences"},
        {
            "$group": {
                "_id": "$occurrences.device_info.model",
                "crash_count": {"$sum": 1},
                "unique_crashes": {"$addToSet": "$error_type"}
            }
        },
        {"$sort": {"crash_count": -1}},
        {"$limit": 10}
    ]

    device_results = list(crashes_collection.aggregate(device_pipeline))

    # Format for frontend charts
    device_patterns = [
        {
            "name": item['_id'] or "Unknown Device",
            "value": item['crash_count'],
            "unique_types": len(item['unique_crashes'])
        }
        for item in device_results
    ]

    print(f"📱 Device crash patterns: {len(device_patterns)} devices analyzed")
    return device_patterns


def get_top_crashes_by_impact(crashes_collection):
    """
    Get top crashes ranked by impact (frequency + affected users)

    This prioritizes which crashes developers should fix first
    """

    pipeline = [
        {
            "$addFields": {
                "unique_users": {"$size": {"$setUnion": ["$occurrences.user_id"]}},
                "impact_score": {"$multiply": ["$count", {"$size": {"$setUnion": ["$occurrences.user_id"]}}]}
            }
        },
        {"$sort": {"impact_score": -1}},
        {"$limit": 10}
    ]

    results = list(crashes_collection.aggregate(pipeline))

    # Format for frontend
    top_crashes = [
        {
            "name": f"{item['error_type'][:30]}...",
            "value": item['count'],
            "users_affected": item['unique_users'],
            "impact_score": item['impact_score']
        }
        for item in results
    ]

    print(f"🎯 Top crashes by impact: {len(top_crashes)} crashes ranked")
    return top_crashes


def get_recent_crashes_formatted(crashes_collection):
    """Get recent crashes formatted for table display"""

    top_crashes = list(crashes_collection.find({})
                       .sort("last_seen", -1)
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
            "message": crash.get('error_message', '')[:100],
            "device": device_model,
            "count": crash['count'],
            "lastSeen": format_time_ago(crash['last_seen']),
            "trend": get_crash_trend_indicator(crash)  # trend indicator
        })

    return recent_crashes


def get_crash_trend_indicator(crash):
    """
    Determine if crash is trending up, down, or stable

    Analyzes recent occurrences to show trend direction
    """
    occurrences = crash.get('occurrences', [])

    if len(occurrences) < 2:
        return "stable"

    # Look at recent occurrences (last 7 days vs previous 7 days)
    now = datetime.now()
    week_ago = now - timedelta(days=7)
    two_weeks_ago = now - timedelta(days=14)

    recent_count = 0
    previous_count = 0

    for occurrence in occurrences:
        timestamp = occurrence.get('timestamp')
        if isinstance(timestamp, str):
            timestamp = datetime.fromisoformat(timestamp.replace('Z', '+00:00'))

        if timestamp >= week_ago:
            recent_count += 1
        elif timestamp >= two_weeks_ago:
            previous_count += 1

    if recent_count > previous_count:
        return "increasing"
    elif recent_count < previous_count:
        return "decreasing"
    else:
        return "stable"


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