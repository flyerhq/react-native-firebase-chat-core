/**
 * @format
 */

import 'react-native-gesture-handler'
import { AppRegistry } from 'react-native'
import { enableScreens } from 'react-native-screens'
import { name as appName } from './app.json'
import AppContainer from './src/AppContainer'

enableScreens()

AppRegistry.registerComponent(appName, () => AppContainer)
