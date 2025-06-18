# Add project specific ProGuard rules here.
# You can control the set of applied configuration files using the
# proguardFiles setting in build.gradle.

# Keep everything in the analytics package since it's a public API
-keep public class com.insighttrack.analytics.** { *; }
