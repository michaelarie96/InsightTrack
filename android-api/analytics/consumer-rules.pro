# Keep all public classes and methods in the analytics package
-keep public class com.insighttrack.analytics.** { *; }

# Keep Retrofit interfaces
-keep interface com.insighttrack.analytics.network.** { *; }

# Keep data models for JSON serialization
-keep class com.insighttrack.analytics.models.** { *; }

# Keep Gson annotations
-keepattributes *Annotation*
-keepattributes Signature