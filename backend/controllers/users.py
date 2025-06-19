from flask import Blueprint, request, jsonify
from datetime import datetime, timedelta
import uuid
from mongodb_connection_manager import AnalyticsConnectionHolder
from ip_geolocation import ip_geo_service
from validation_utils import (
    validate_required_fields,
    parse_timestamp,
    check_database_connection,
    format_timestamps_in_document,
    create_success_response,
    create_error_response
)

users_blueprint = Blueprint('users', __name__)


@users_blueprint.route('/users', methods=['POST'])
def register_user():
    """Register or update a user in the analytics system"""

    print("👤 Received user registration/update...")

    try:
        data = request.json
        db = AnalyticsConnectionHolder.get_db()

        # Database connection check
        is_connected, error_response = check_database_connection(db)
        if not is_connected:
            return error_response

        # Required field validation
        required_fields = ['package_name', 'user_id']
        is_valid, error_response = validate_required_fields(data, required_fields)
        if not is_valid:
            return error_response

        # Parse timestamp
        timestamp, error_response = parse_timestamp(data.get('timestamp'))
        if error_response:
            return error_response

        package_name = data['package_name']
        user_id = data['user_id']

        # Get country using hybrid approach (IP + locale fallback)
        client_country = data.get('country', 'Unknown')
        location_result = ip_geo_service.get_country_with_fallback(client_country)

        final_country = location_result['country']
        detection_method = location_result['detection_method']

        print(f"👤 User {user_id} location: {final_country} (via {detection_method})")

        # Check if user already exists
        users_collection = db[f"{package_name}_users"]
        existing_user = users_collection.find_one({"user_id": user_id})

        if existing_user:
            # Update existing user's last_active time
            users_collection.update_one(
                {"user_id": user_id},
                {
                    "$set": {
                        "last_active": timestamp,
                        "updated_at": datetime.now()
                    }
                }
            )
            print(f"✅ Updated existing user: {user_id}")

            return create_success_response(
                "User updated successfully",
                {"user_id": user_id, "action": "updated"}
            )

        else:
            # Create new user document
            user_doc = {
                "_id": str(uuid.uuid4()),
                "user_id": user_id,
                "first_seen": timestamp,
                "last_active": timestamp,
                "country": final_country,
                "location_metadata": {
                    "detection_method": detection_method,
                    "confidence": location_result['confidence'],
                    "ip_country": location_result.get('ip_country'),
                    "client_country": location_result.get('client_country')
                },
                "device_info": data.get('device_info', {}),
                "properties": data.get('properties', {}),
                "created_at": datetime.now(),
                "updated_at": datetime.now()
            }

            # Store in package-specific collection
            users_collection.insert_one(user_doc)
            print(f"✅ Registered new user: {user_id}")

            return create_success_response(
                "User registered successfully",
                {"user_id": user_id, "action": "created"},
                201
            )

    except Exception as e:
        print(f"❌ Error in user registration: {str(e)}")
        return create_error_response(f"Failed to register user: {str(e)}")


@users_blueprint.route('/users/<package_name>', methods=['GET'])
def get_users(package_name):
    """Get all users for a specific package"""

    print(f"👥 Getting users for package: {package_name}")

    try:
        db = AnalyticsConnectionHolder.get_db()
        if db is None:
            return jsonify({"error": "Could not connect to the database"}), 500

        # Get query parameters
        limit = int(request.args.get('limit', 100))
        active_only = request.args.get('active_only', 'false').lower() == 'true'

        # Build query filter
        query_filter = {}
        if active_only:
            # Users active in the last 30 days
            thirty_days_ago = datetime.now() - timedelta(days=30)
            query_filter['last_active'] = {"$gte": thirty_days_ago}

        # Get users from package-specific collection
        users_collection = db[f"{package_name}_users"]
        users = list(users_collection.find(query_filter)
                     .sort("last_active", -1)
                     .limit(limit))

        # Convert timestamps to ISO format
        timestamp_fields = ['first_seen', 'last_active', 'created_at', 'updated_at']
        for user in users:
            format_timestamps_in_document(user, timestamp_fields)

        return jsonify({
            "package_name": package_name,
            "users": users,
            "count": len(users)
        }), 200

    except Exception as e:
        return create_error_response(f"Failed to retrieve users: {str(e)}")


@users_blueprint.route('/users/<package_name>/stats', methods=['GET'])
def get_user_stats(package_name):
    """Get user statistics for dashboard"""

    print(f"📊 Generating user statistics for: {package_name}")

    try:
        db = AnalyticsConnectionHolder.get_db()
        if db is None:
            return jsonify({"error": "Could not connect to the database"}), 500

        users_collection = db[f"{package_name}_users"]

        # Get total user count
        total_users = users_collection.count_documents({})

        # Get active users (last 30 days)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        active_users = users_collection.count_documents({
            "last_active": {"$gte": thirty_days_ago}
        })

        # Get new users today
        today_start = datetime.now().replace(hour=0, minute=0, second=0, microsecond=0)
        new_users_today = users_collection.count_documents({
            "first_seen": {"$gte": today_start}
        })

        # Get users by country (for geographic distribution)
        country_pipeline = [
            {"$group": {"_id": "$country", "count": {"$sum": 1}}},
            {"$sort": {"count": -1}},
            {"$limit": 10}
        ]
        users_by_country = list(users_collection.aggregate(country_pipeline))

        # Format for frontend charts
        geographic_distribution = [
            {"name": item['_id'], "value": item['count']}
            for item in users_by_country
        ]

        # Get user growth over last 30 days
        growth_data = []
        for i in range(30, 0, -1):
            date = datetime.now() - timedelta(days=i)
            date_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
            date_end = date_start + timedelta(days=1)

            daily_users = users_collection.count_documents({
                "first_seen": {"$gte": date_start, "$lt": date_end}
            })

            growth_data.append({
                "date": date.strftime("%Y-%m-%d"),
                "users": daily_users
            })

        return jsonify({
            "package_name": package_name,
            "total_users": total_users,
            "active_users": active_users,
            "new_users_today": new_users_today,
            "user_growth": growth_data,
            "geographic_distribution": geographic_distribution
        }), 200

    except Exception as e:
        return create_error_response(f"Failed to get user statistics: {str(e)}")