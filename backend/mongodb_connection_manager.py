import os
from pymongo import MongoClient
from pymongo.server_api import ServerApi


class AnalyticsConnectionHolder:
    """Singleton class to manage MongoDB connection for Analytics API"""
    __db = None

    @staticmethod
    def initialize_db():
        """Initialize database connection with error handling"""
        if AnalyticsConnectionHolder.__db is None:
            try:
                # Get connection details from environment variables
                connection_string = os.getenv("DB_CONNECTION_STRING")
                db_name = os.getenv("DB_NAME", "analytics_api_db")

                if not connection_string:
                    raise ValueError("DB_CONNECTION_STRING environment variable not set")

                print("🔗 Connecting to MongoDB...")

                # Create MongoDB client with connection string
                client = MongoClient(connection_string, server_api=ServerApi('1'))

                # Test connection
                client.admin.command('ping')
                print("✅ Successfully connected to MongoDB!")

                # Set the database instance
                AnalyticsConnectionHolder.__db = client[db_name]

            except Exception as e:
                print(f"❌ Database connection error: {e}")
                AnalyticsConnectionHolder.__db = None

        return AnalyticsConnectionHolder.__db

    @staticmethod
    def get_db():
        """Get database instance, initialize if needed"""
        if AnalyticsConnectionHolder.__db is None:
            AnalyticsConnectionHolder.initialize_db()
        return AnalyticsConnectionHolder.__db

    @staticmethod
    def close_connection():
        """Close database connection (for cleanup)"""
        if AnalyticsConnectionHolder.__db is not None:
            AnalyticsConnectionHolder.__db.client.close()
            AnalyticsConnectionHolder.__db = None
            print("🔒 Database connection closed")