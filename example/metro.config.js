/**
 * Metro configuration for React Native
 * https://github.com/facebook/react-native
 *
 * @format
 */

const path = require('path')
const blacklist = require('metro-config/src/defaults/blacklist')

const moduleRoot = path.resolve(__dirname, '..')

module.exports = {
  watchFolders: [moduleRoot],
  resolver: {
    extraNodeModules: {
      react: path.resolve(__dirname, 'node_modules/react'),
      'react-native': path.resolve(__dirname, 'node_modules/react-native'),
      '@react-native-firebase/app': path.resolve(
        __dirname,
        'node_modules/@react-native-firebase/app'
      ),
      '@react-native-firebase/auth': path.resolve(
        __dirname,
        'node_modules/@react-native-firebase/auth'
      ),
      '@react-native-firebase/firestore': path.resolve(
        __dirname,
        'node_modules/@react-native-firebase/firestore'
      ),
    },
    blacklistRE: blacklist([
      new RegExp(`${moduleRoot}/node_modules/react/.*`),
      new RegExp(`${moduleRoot}/node_modules/react-native/.*`),
      new RegExp(`${moduleRoot}/node_modules/@react-native-firebase/app/.*`),
      new RegExp(`${moduleRoot}/node_modules/@react-native-firebase/auth/.*`),
      new RegExp(
        `${moduleRoot}/node_modules/@react-native-firebase/firestore/.*`
      ),
    ]),
  },
  transformer: {
    getTransformOptions: async () => ({
      transform: {
        experimentalImportSupport: false,
        inlineRequires: false,
      },
    }),
  },
}
