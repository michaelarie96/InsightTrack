from flask import Blueprint, request, jsonify
from datetime import datetime
import uuid
from mongodb_connection_manager import AnalyticsConnectionHolder

events_blueprint = Blueprint('events', __name__)


@events_blueprint.route('/events', methods=['POST'])
def log_event():
    """Log a new analytics event from SDK"""

    print("📱 Received event from Android app...")

    try:
        data = request.json
        db = AnalyticsConnectionHolder.get_db()

        # Database connection check
        if db is None:
            return jsonify({"error": "Could not connect to the database"}), 500

        # Required field validation
        required_fields = ['package_name', 'event_type', 'user_id']
        missing_fields = [field for field in required_fields if field not in data]
        if missing_fields:
            return jsonify({
                "error": f"Missing required fields: {', '.join(missing_fields)}"
            }), 400

        # Parse timestamp if provided, otherwise use current time
        timestamp = datetime.now()
        if 'timestamp' in data:
            try:
                # Handle both millisecond timestamps and ISO strings
                if isinstance(data['timestamp'], (int, float)):
                    timestamp = datetime.fromtimestamp(data['timestamp'] / 1000)
                else:
                    timestamp = datetime.fromisoformat(data['timestamp'].replace('Z', '+00:00'))
            except (ValueError, TypeError):
                return jsonify({"error": "Invalid timestamp format"}), 400

        # Create event document
        event_doc = {
            "_id": str(uuid.uuid4()),
            "event_type": data['event_type'],
            "user_id": data['user_id'],
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

        return jsonify({
            "message": "Event logged successfully",
            "event_id": event_doc['_id'],
            "timestamp": timestamp.isoformat()
        }), 201

    except Exception as e:
        return jsonify({"error": f"Failed to log event: {str(e)}"}), 500


@events_blueprint.route('/events/<package_name>', methods=['GET'])
def get_events(package_name):
    """Get all events for a specific package"""

    print(f"📋 Getting events for package: {package_name}")

    try:
        db = AnalyticsConnectionHolder.get_db()
        if db is None:
            return jsonify({"error": "Could not connect to the database"}), 500

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

        # Convert ObjectId to string and format dates
        for event in events:
            event['timestamp'] = event['timestamp'].isoformat()
            event['created_at'] = event['created_at'].isoformat()

        return jsonify({
            "package_name": package_name,
            "events": events,
            "count": len(events)
        }), 200

    except Exception as e:
        return jsonify({"error": f"Failed to retrieve events: {str(e)}"}), 500


@events_blueprint.route('/events/<package_name>/stats', methods=['GET'])
def get_event_stats(package_name):
    """Get event statistics for dashboard"""

    print(f"📈 Generating event statistics for: {package_name}")

    try:
        db = AnalyticsConnectionHolder.get_db()
        if db is None:
            return jsonify({"error": "Could not connect to the database"}), 500

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
        return jsonify({"error": f"Failed to get event statistics: {str(e)}"}), 500