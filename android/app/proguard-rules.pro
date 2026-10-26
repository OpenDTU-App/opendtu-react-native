# ============================================================================
# Core React Native & Architecture (Reanimated, Screens, FlashList)
# ============================================================================

# React Native Reanimated & Worklets (Crucial for animations not to crash)
-keep class com.swmansion.reanimated.** { *; }
-keep interface com.swmansion.reanimated.** { *; }
-dontwarn com.swmansion.reanimated.**
-keep class com.nozbe.watermelondb.** { *; } # dynamically loaded JNI classes if shared

# React Native Screens
-keep class com.swmansion.rnscreens.** { *; }

# Shopify Flash-List (Prevents layout/item measurement code from stripping)
-keep class com.shopify.flashlist.** { *; }

# ============================================================================
# Storage, Configurations, & Polyfills (MMKV, Config, Vector Icons)
# ============================================================================

# React Native MMKV (Protects C++ JNI bridge interfaces)
-keep class com.tencent.mmkv.** { *; }

# React Native Config (Prevents your environment variables from being stripped or renamed)
-keep class com.lugg.ReactNativeConfig.** { *; }

# React Native Vector Icons (Ensures custom font files remain referenced)
-keep class LinAlg.** { *; }
-dontwarn com.oblador.vectoricons.**

# React Native FS
-dontwarn com.rnfs.**

# ============================================================================
# UI Components & Graphics (Charts, SVG, FastImage)
# ============================================================================

# React Native Charts Wrapper (MPAndroidChart underlying library uses reflection)
-keep class com.github.mikephil.charting.** { *; }
-dontwarn com.github.mikephil.charting.**

# React Native FastImage (Protects Glide caching mechanisms and configuration)
-keep public class * extends com.bumptech.glide.module.AppGlideModule
-keep public class * extends com.bumptech.glide.module.LibraryGlideModule
-dontwarn com.bumptech.glide.**

# React Native SVG
-keep class com.horcrux.svg.** { *; }

# ============================================================================
# State & Serialization (Redux Persist)
# ============================================================================

# Redux Persist (Keeps standard serializable models from being aggressively obfuscated)
-keepclassmembers class * implements java.io.Serializable {
    static final long serialVersionUID;
    private static final java.io.ObjectStreamField[] serialPersistentFields;
    private void writeObject(java.io.ObjectOutputStream);
    private void readObject(java.io.ObjectInputStream);
    java.lang.Object writeReplace();
    java.lang.Object readResolve();
}
