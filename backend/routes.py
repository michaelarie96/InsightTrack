from flask import Blueprint


def register_routes(app):
    """Register all API routes with the Flask app"""

    print("📋 Setting up API routes...")

    # Import all controllers
    from controllers.events import events_blueprint
    from controllers.users import users_blueprint
    from controllers.sessions import sessions_blueprint
    from controllers.crashes import crashes_blueprint

    # Register blueprints with URL prefixes
    app.register_blueprint(events_blueprint, url_prefix='/analytics')
    app.register_blueprint(users_blueprint, url_prefix='/analytics')
    app.register_blueprint(sessions_blueprint, url_prefix='/analytics')
    app.register_blueprint(crashes_blueprint, url_prefix='/analytics')

    print("✅ All API routes registered!")

    # API documentation route (will add Swagger later)
    @app.route('/api/docs')
    def api_docs():
        return {
            "message": "Analytics API Documentation",
            "version": "1.0.0",
            "endpoints": {
                "events": "/analytics/events",
                "users": "/analytics/users",
                "sessions": "/analytics/sessions",
                "crashes": "/analytics/crashes",
                "health": "/health"
            }
        }, 200