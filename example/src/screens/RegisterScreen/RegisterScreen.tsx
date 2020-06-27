import { useUsers } from '@flyerhq/react-native-firebase-chat-core'
import auth from '@react-native-firebase/auth'
import { CompositeNavigationProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import faker from 'faker'
import React, { useRef, useState } from 'react'
import { Alert, Button, ScrollView, StyleSheet, TextInput } from 'react-native'
import { AuthStackParamList, RootStackParamList } from 'src/types'

interface Props {
  navigation: CompositeNavigationProp<
    StackNavigationProp<RootStackParamList, 'Auth'>,
    StackNavigationProp<AuthStackParamList>
  >
}

const RegisterScreen = ({ navigation }: Props) => {
  const passwordInput = useRef<TextInput>(null)
  const [email, setEmail] = useState(faker.internet.email())
  const [password, setPassword] = useState('Qawsed1-')
  const [registering, setRegistering] = useState(false)
  const { createUserInFirestore } = useUsers()

  const register = async () => {
    try {
      setRegistering(true)
      const credential = await auth().createUserWithEmailAndPassword(
        email,
        password
      )
      await createUserInFirestore({
        avatarUrl: faker.image.avatar(),
        firstName: faker.name.firstName(),
        id: credential.user.uid,
        lastName: faker.name.lastName(),
      })
      setRegistering(false)
      navigation.navigate('Main')
    } catch (e) {
      Alert.alert('Error', e.message, [{ text: 'OK' }])
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
        autoCompleteType='email'
        autoCorrect={false}
        autoFocus
        clearButtonMode='while-editing'
        editable={!registering}
        enablesReturnKeyAutomatically
        key='registerEmail'
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
        autoCompleteType='password'
        autoCorrect={false}
        clearButtonMode='while-editing'
        editable={!registering}
        enablesReturnKeyAutomatically
        key='registerPassword'
        onChangeText={setPassword}
        onSubmitEditing={register}
        placeholder='Password'
        returnKeyType='send'
        secureTextEntry
        style={styles.input}
        textContentType='password'
        value={password}
      />
      <Button disabled={registering} title='Register' onPress={register} />
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

export default RegisterScreen
