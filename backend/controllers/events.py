from flask import Blueprint, request, jsonify
from datetime import datetime
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

events_blueprint = Blueprint('events', __name__)


@events_blueprint.route('/events', methods=['POST'])
def log_event():
    """Log a new analytics event from SDK"""

    print("📱 Received event from Android app...")

    try:
        data = request.json
        db = AnalyticsConnectionHolder.get_db()

        # Database connection check
        is_connected, error_response = check_database_connection(db)
        if not is_connected:
            return error_response

        # Required field validation
        required_fields = ['package_name', 'event_type']
        is_valid, error_response = validate_required_fields(data, required_fields)
        if not is_valid:
            return error_response

        # Parse timestamp
        timestamp, error_response = parse_timestamp(data.get('timestamp'))
        if error_response:
            return error_response

        # Create event document
        event_doc = {
            "_id": str(uuid.uuid4()),
            "event_type": data['event_type'],
            "user_id": data.get('user_id'),
            "timestamp": timestamp,
            "properties": data.get('properties', {}),
            "session_id": data.get('session_id'),
            "device_info": data.get('device_info', {}),
            "created_at": datetime.now()
        }

        # Store in package-specific collection
        package_name = data['package_name']
        events_collection = db[f"{package_name}_events"]
        result = events_collection.insert_one(event_doc)
        print(f"✅ Event stored successfully with ID: {event_doc['_id']}")

        return create_success_response(
            "Event logged successfully",
            {
                "event_id": event_doc['_id'],
                "timestamp": timestamp.isoformat()
            },
            201
        )

    except Exception as e:
        return create_error_response(f"Failed to log event: {str(e)}")


@events_blueprint.route('/events/<package_name>', methods=['GET'])
def get_events(package_name):
    """Get all events for a specific package"""

    print(f"📋 Getting events for package: {package_name}")

    try:
        db = AnalyticsConnectionHolder.get_db()

        # Database connection check
        is_connected, error_response = check_database_connection(db)
        if not is_connected:
            return error_response

        # Get query parameters for filtering
        limit = int(request.args.get('limit', 100))
        event_type = request.args.get('event_type')

        # Build query filter
        query_filter = {}
        if event_type:
            query_filter['event_type'] = event_type

        # Get events from package-specific collection
        events_collection = db[f"{package_name}_events"]
        events = list(events_collection.find(query_filter)
                      .sort("timestamp", -1)
                      .limit(limit))

        # Convert timestamps to ISO format AND add display formatting
        timestamp_fields = ['timestamp', 'created_at']
        for event in events:
            format_timestamps_in_document(event, timestamp_fields)

            # Add display formatting for Recent Activity table
            if 'timestamp' in event:
                timestamp_obj = datetime.fromisoformat(event['timestamp'].replace('Z', '+00:00'))
                event['full_date'] = timestamp_obj.strftime('%Y-%m-%d')
                event['time_only'] = timestamp_obj.strftime('%H:%M')

            # Format user display (truncate long user IDs)
            if event.get('user_id'):
                user_id = event['user_id']
                event['user_display'] = user_id[:8] + '...' if len(user_id) > 8 else user_id
            else:
                event['user_display'] = 'Anonymous'

            # Create properties preview (first 2 properties)
            props = event.get('properties', {})
            if props and isinstance(props, dict):
                # Get first 2 key-value pairs
                prop_items = list(props.items())[:2]
                prop_preview = ', '.join([f"{k}: {v}" for k, v in prop_items])
                event['properties_preview'] = prop_preview[:40] + '...' if len(prop_preview) > 40 else prop_preview
            else:
                event['properties_preview'] = 'No properties'

        return jsonify({
            "package_name": package_name,
            "events": events,
            "count": len(events)
        }), 200

    except Exception as e:
        return create_error_response(f"Failed to retrieve events: {str(e)}")


@events_blueprint.route('/events/<package_name>/stats', methods=['GET'])
def get_event_stats(package_name):
    """Get event statistics for dashboard"""

    print(f"📈 Generating event statistics for: {package_name}")

    try:
        db = AnalyticsConnectionHolder.get_db()

        # Database connection check
        is_connected, error_response = check_database_connection(db)
        if not is_connected:
            return error_response

        events_collection = db[f"{package_name}_events"]

        # Get total event count
        total_events = events_collection.count_documents({})

        # Get events by type (for top events chart)
        event_type_pipeline = [
            {"$group": {"_id": "$event_type", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        events_by_type = list(events_collection.aggregate(event_type_pipeline))

        # Format for frontend charts
        top_events = [
            {"name": item['_id'], "value": item['count']}
            for item in events_by_type
        ]

        # Get events by date (for time series chart)
        daily_events_pipeline = [
            {
                "$group": {
                    "_id": {"$dateToString": {"format": "%Y-%m-%d", "date": "$timestamp"}},
                    "count": {"$sum": 1}
                }
            },
            {"$sort": {"_id": 1}},
            {"$limit": 30}
        ]
        daily_events = list(events_collection.aggregate(daily_events_pipeline))

        # Format for frontend charts
        daily_chart_data = [
            {"date": item['_id'], "events": item['count']}
            for item in daily_events
        ]

        return jsonify({
            "package_name": package_name,
            "total_events": total_events,
            "top_events": top_events,
            "daily_events": daily_chart_data
        }), 200

    except Exception as e:
        return create_error_response(f"Failed to get event statistics: {str(e)}")