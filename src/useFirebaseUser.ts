import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import * as React from 'react'

export const useFirebaseUser = () => {
  const [firebaseUser, setFirebaseUser] = React.useState<
    FirebaseAuthTypes.User | undefined
  >()

  React.useEffect(() => {
    return auth().onAuthStateChanged((user) => {
      setFirebaseUser(user ?? undefined)
    })
  })

  return { firebaseUser }
}
