from flask import Blueprint
users_blueprint = Blueprint('users', __name__)

@users_blueprint.route('/users', methods=['GET'])
def get_users():
    return {"message": "Users endpoint - coming soon!"}, 200