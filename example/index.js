/**
 * @format
 */

import 'react-native-gesture-handler'
import { AppRegistry } from 'react-native'
import { enableScreens } from 'react-native-screens'
import { name as appName } from './app.json'
import App from './src/App'

enableScreens()

AppRegistry.registerComponent(appName, () => App)
