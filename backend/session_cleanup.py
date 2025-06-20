"""
Session Cleanup Service for Analytics API

Automatically closes sessions that have been open too long.
This handles cases where the app was killed and couldn't send a session end event.
"""

from datetime import datetime, timedelta
from mongodb_connection_manager import AnalyticsConnectionHolder


class SessionCleanupService:
    """Service to clean up sessions that never received an 'end' event"""

    def __init__(self):
        self.session_timeout_hours = 2  # Close sessions after 2 hours of inactivity
        print(f"🧹 Session cleanup service initialized (timeout: {self.session_timeout_hours} hours)")

    def cleanup_stale_sessions(self, package_name=None):
        """
        Find and close sessions that have been open too long

        Args:
            package_name: Specific package to clean up, or None for all packages
        """

        try:
            db = AnalyticsConnectionHolder.get_db()
            if db is None:
                print("❌ Cannot connect to database for session cleanup")
                return

            cutoff_time = datetime.now() - timedelta(hours=self.session_timeout_hours)

            # Find session collections
            collection_names = db.list_collection_names()
            session_collections = [name for name in collection_names if name.endswith('_sessions')]

            # Filter to specific package if requested
            if package_name:
                session_collections = [f"{package_name}_sessions"]

            total_closed = 0

            for collection_name in session_collections:
                closed_count = self._cleanup_sessions_for_collection(db, collection_name, cutoff_time)
                total_closed += closed_count

            if total_closed > 0:
                print(f"✅ Session cleanup completed: {total_closed} stale sessions closed")
            else:
                print("✅ Session cleanup completed: no stale sessions found")

            return total_closed

        except Exception as e:
            print(f"❌ Error during session cleanup: {str(e)}")
            return 0

    def _cleanup_sessions_for_collection(self, db, collection_name, cutoff_time):
        """Clean up sessions for a specific package collection"""

        try:
            sessions_collection = db[collection_name]

            # Find sessions that are still open (no end_time) and started more than 2 hours ago
            stale_sessions = sessions_collection.find({
                "end_time": None,
                "start_time": {"$lt": cutoff_time}
            })

            closed_count = 0

            for session in stale_sessions:
                # Calculate duration from start to cutoff time
                start_time = session['start_time']
                duration_seconds = int((cutoff_time - start_time).total_seconds())

                # Close the session
                sessions_collection.update_one(
                    {"_id": session['_id']},
                    {
                        "$set": {
                            "end_time": cutoff_time,
                            "duration_seconds": duration_seconds,
                            "updated_at": datetime.now(),
                            "closed_by": "auto_cleanup",
                            "reason": f"Session timeout after {self.session_timeout_hours} hours"
                        }
                    }
                )

                closed_count += 1
                print(f"🧹 Auto-closed stale session: {session['session_id']} (duration: {duration_seconds}s)")

            return closed_count

        except Exception as e:
            print(f"❌ Error cleaning up sessions for {collection_name}: {str(e)}")
            return 0

    def get_session_timeout_hours(self):
        """Get the current session timeout setting"""
        return self.session_timeout_hours

    def set_session_timeout_hours(self, hours):
        """Set a new session timeout (for testing)"""
        self.session_timeout_hours = hours
        print(f"🔧 Session timeout updated to {hours} hours")


session_cleanup_service = SessionCleanupService()