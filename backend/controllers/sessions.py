from flask import Blueprint
sessions_blueprint = Blueprint('sessions', __name__)

@sessions_blueprint.route('/sessions', methods=['GET'])
def get_sessions():
    return {"message": "Sessions endpoint - coming soon!"}, 200