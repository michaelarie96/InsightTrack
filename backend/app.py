from flask import Flask
from flask_cors import CORS
from dotenv import load_dotenv
import os

# Import route registration
from routes import register_routes

# Load environment variables
load_dotenv()


def create_app():
    """Application factory pattern for Flask app"""
    app = Flask(__name__)

    # Enable CORS for frontend integration
    CORS(app, origins=["http://localhost:3000", "http://localhost:5173"])

    # Basic configuration
    app.config['SECRET_KEY'] = os.getenv('SECRET_KEY', 'dev-secret-key')

    # Register all routes
    register_routes(app)

    # Basic health check endpoint
    @app.route('/health')
    def health_check():
        return {"status": "healthy", "service": "analytics-api"}, 200

    return app


# Create the app instance
app = create_app()

if __name__ == '__main__':
    print("🚀 Starting Analytics API server...")
    print("📡 API will be available at: http://localhost:5000")
    app.run(debug=True)