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
    """Get comprehensive user statistics for dashboard"""

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

        # Calculate user growth over time
        user_growth = calculate_user_growth(users_collection)

        # Calculate user retention rates
        user_retention = calculate_user_retention(users_collection)

        # Get users by country (for geographic distribution)
        geographic_distribution = get_geographic_distribution(users_collection)

        return jsonify({
            "package_name": package_name,
            "total_users": total_users,
            "active_users": active_users,
            "new_users_today": new_users_today,
            "user_growth": user_growth,
            "user_retention": user_retention,
            "geographic_distribution": geographic_distribution
        }), 200

    except Exception as e:
        return create_error_response(f"Failed to get user statistics: {str(e)}")


def calculate_user_growth(users_collection):
    """
    Calculate user growth over the last 30 days
    """
    growth_data = []

    # Go back 30 days and count new users each day
    for i in range(30, 0, -1):
        date = datetime.now() - timedelta(days=i)
        date_start = date.replace(hour=0, minute=0, second=0, microsecond=0)
        date_end = date_start + timedelta(days=1)

        # Count users who first registered on this specific day
        daily_new_users = users_collection.count_documents({
            "first_seen": {"$gte": date_start, "$lt": date_end}
        })

        growth_data.append({
            "date": date.strftime("%Y-%m-%d"),
            "users": daily_new_users,
            "month": date.strftime("%b")
        })

    print(f"📈 Calculated growth for {len(growth_data)} days")
    return growth_data


def calculate_user_retention(users_collection):
    """
    Calculate user retention rates
    """

    thirty_days_ago = datetime.now() - timedelta(days=30)

    # Find users who registered more than 30 days ago
    cohort_users = list(users_collection.find({
        "first_seen": {"$lt": thirty_days_ago}
    }))

    if len(cohort_users) == 0:
        print("📊 Not enough historical data for retention analysis")
        return []

    retention_data = []

    # Calculate for different time periods
    retention_periods = [
        {"name": "Day 1", "days": 1},
        {"name": "Day 3", "days": 3},
        {"name": "Day 7", "days": 7},
        {"name": "Day 14", "days": 14},
        {"name": "Day 30", "days": 30}
    ]

    for period in retention_periods:
        retained_count = 0

        for user in cohort_users:
            first_seen = user['first_seen']
            target_date = first_seen + timedelta(days=period['days'])

            # Check if user was active after the target date
            if user['last_active'] >= target_date:
                retained_count += 1

        retention_rate = (retained_count / len(cohort_users)) * 100 if len(cohort_users) > 0 else 0

        retention_data.append({
            "day": period['name'],
            "retention": round(retention_rate, 1)
        })

    print(f"📊 Calculated retention for {len(cohort_users)} users")
    return retention_data


def get_geographic_distribution(users_collection):
    """
    Get user distribution by country
    """
    country_pipeline = [
        {"$group": {"_id": "$country", "count": {"$sum": 1}}},
        {"$sort": {"count": -1}},
        {"$limit": 10}  # Top 10 countries
    ]

    users_by_country = list(users_collection.aggregate(country_pipeline))

    # Format for frontend charts
    geographic_distribution = [
        {"name": item['_id'] or "Unknown", "value": item['count']}
        for item in users_by_country
    ]

    print(f"🌍 Geographic distribution: {len(geographic_distribution)} countries")
    return geographic_distribution