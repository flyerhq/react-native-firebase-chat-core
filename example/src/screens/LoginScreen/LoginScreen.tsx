import auth from '@react-native-firebase/auth'
import { CompositeNavigationProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useLayoutEffect, useRef, useState } from 'react'
import {
  Alert,
  Button,
  Platform,
  ScrollView,
  StyleSheet,
  TextInput,
} from 'react-native'
import { AuthStackParamList, RootStackParamList } from 'src/types'

interface Props {
  navigation: CompositeNavigationProp<
    NativeStackNavigationProp<RootStackParamList, 'Auth'>,
    NativeStackNavigationProp<AuthStackParamList>
  >
}

const LoginScreen = ({ navigation }: Props) => {
  const passwordInput = useRef<TextInput>(null)
  const [email, setEmail] = useState('')
  const [loggingIn, setLoggingIn] = useState(false)
  const [password, setPassword] = useState('Qawsed1-')

  useLayoutEffect(() => {
    Platform.OS === 'ios' &&
      navigation.setOptions({
        headerLeft: () => <Button onPress={navigation.goBack} title='Cancel' />,
      })
  })

  const login = async () => {
    try {
      setLoggingIn(true)
      await auth().signInWithEmailAndPassword(email, password)
      setLoggingIn(false)
      navigation.navigate('Main')
    } catch (e) {
      setLoggingIn(false)
      Alert.alert('Error', (e as Error).message, [{ text: 'OK' }])
    }
  }

  return (
    <ScrollView
      contentContainerStyle={styles.contentContainer}
      keyboardDismissMode='interactive'
      keyboardShouldPersistTaps='handled'
      style={styles.container}
    >
      <TextInput
        autoCapitalize='none'
        autoComplete='email'
        autoCorrect={false}
        autoFocus
        clearButtonMode='while-editing'
        editable={!loggingIn}
        enablesReturnKeyAutomatically
        key='loginEmail'
        keyboardType='email-address'
        onChangeText={setEmail}
        onSubmitEditing={passwordInput.current?.focus}
        placeholder='Email'
        returnKeyType='next'
        style={styles.input}
        textContentType='emailAddress'
        value={email}
      />
      <TextInput
        ref={passwordInput}
        autoCapitalize='none'
        autoComplete='password'
        autoCorrect={false}
        clearButtonMode='while-editing'
        editable={!loggingIn}
        enablesReturnKeyAutomatically
        key='loginPassword'
        onChangeText={setPassword}
        onSubmitEditing={login}
        placeholder='Password'
        returnKeyType='send'
        secureTextEntry
        style={styles.input}
        textContentType='password'
        value={password}
      />
      <Button disabled={loggingIn} title='Login' onPress={login} />
      <Button
        disabled={loggingIn}
        title='Register'
        onPress={() => navigation.navigate('Register')}
      />
    </ScrollView>
  )
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
  },
  contentContainer: {
    paddingTop: 80,
    paddingHorizontal: 24,
  },
  input: {
    borderWidth: 1,
    padding: 8,
    marginBottom: 8,
    borderRadius: 8,
    borderColor: '#ccc',
    color: 'black',
  },
})

export default LoginScreen
