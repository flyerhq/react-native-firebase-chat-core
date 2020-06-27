import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import * as React from 'react'

export const useFirebaseUser = () => {
  const [user, setUser] = React.useState<FirebaseAuthTypes.User | undefined>()

  React.useEffect(() => {
    return auth().onAuthStateChanged((firebaseUser) => {
      setUser(firebaseUser ?? undefined)
    })
  })

  return { user }
}
