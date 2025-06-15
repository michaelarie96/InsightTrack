from flask import Blueprint
crashes_blueprint = Blueprint('crashes', __name__)

@crashes_blueprint.route('/crashes', methods=['GET'])
def get_crashes():
    return {"message": "Crashes endpoint - coming soon!"}, 200