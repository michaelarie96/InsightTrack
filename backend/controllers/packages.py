from flask import Blueprint, jsonify

from mongodb_connection_manager import AnalyticsConnectionHolder
from validation_utils import create_error_response

packages_blueprint = Blueprint('packages', __name__)


@packages_blueprint.route('/packages', methods=['GET'])
def get_all_packages():
    """Get all packages that have data in the system"""

    print("📦 Getting all available packages...")

    try:
        db = AnalyticsConnectionHolder.get_db()
        if db is None:
            return create_error_response("Could not connect to the database")

        collection_names = db.list_collection_names()

        # Find package names by looking for collections ending with '_events'
        packages = set()
        for collection_name in collection_names:
            if collection_name.endswith('_events'):
                package_name = collection_name.replace('_events', '')
                packages.add(package_name)

        packages_list = sorted(list(packages))

        print(f"✅ Found {len(packages_list)} packages: {packages_list}")

        return jsonify({
            "packages": packages_list,
            "count": len(packages_list)
        }), 200

    except Exception as e:
        return create_error_response(f"Failed to get packages: {str(e)}")


@packages_blueprint.route('/packages/<package_name>/summary', methods=['GET'])
def get_package_summary(package_name):
    """Get a quick summary of a package's data"""

    print(f"📊 Getting summary for package: {package_name}")

    try:
        db = AnalyticsConnectionHolder.get_db()
        if db is None:
            return create_error_response("Could not connect to the database")

        # Count data in each collection type
        events_count = db[f"{package_name}_events"].count_documents({})
        users_count = db[f"{package_name}_users"].count_documents({})
        sessions_count = db[f"{package_name}_sessions"].count_documents({})
        crashes_count = db[f"{package_name}_crashes"].count_documents({})

        return jsonify({
            "package_name": package_name,
            "summary": {
                "events": events_count,
                "users": users_count,
                "sessions": sessions_count,
                "crashes": crashes_count,
                "total_data_points": events_count + users_count + sessions_count + crashes_count
            }
        }), 200

    except Exception as e:
        return create_error_response(f"Failed to get package summary: {str(e)}")