package xyz.commanderred.opendtuapp

import com.facebook.react.ReactActivity
import com.facebook.react.ReactActivityDelegate
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.fabricEnabled
import com.facebook.react.defaults.DefaultReactActivityDelegate

import android.os.Bundle

import org.devio.rn.splashscreen.SplashScreen

class MainActivity : ReactActivity() {

  /**
   * Returns the name of the main component registered from JavaScript. This is used to schedule
   * rendering of the component.
   */
  override fun getMainComponentName(): String = "opendtu-react-native"

  /**
   * We override onCreate here to pass null as the savedInstanceState parameter. This is because
   * we don't want to restore the React Native state when the activity is recreated. Instead, we
   * want to recreate the whole React Native instance. This is done by the DefaultReactActivityDelegate
   * class which we use below.
   */
  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(null)
    SplashScreen.show(this)
  }

  /**
   * Returns the instance of the [ReactActivityDelegate]. We use [DefaultReactActivityDelegate]
   * which allows you to enable New Architecture with a single boolean flags [fabricEnabled]
   */
  override fun createReactActivityDelegate(): ReactActivityDelegate =
        DefaultReactActivityDelegate(this, mainComponentName, fabricEnabled)
}
