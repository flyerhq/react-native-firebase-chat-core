import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import * as React from 'react'
import { User } from './types'

export const useUsers = () => {
  const [users, setUsers] = React.useState<User[]>([])
  const [user, setUser] = React.useState<FirebaseAuthTypes.User | null>(null)

  React.useEffect(() => {
    return auth().onAuthStateChanged(setUser)
  }, [])

  React.useEffect(() => {
    if (!user) {
      setUsers([])
      return
    }

    return firestore()
      .collection('users')
      .onSnapshot((querySnapshot) => {
        const newUsers: User[] = []

        querySnapshot.forEach((documentSnaphot) => {
          if (user.uid === documentSnaphot.id) return

          const avatarUrl =
            (documentSnaphot.get('avatarUrl') as string | null) ?? undefined
          const firstName = documentSnaphot.get('firstName') as string
          const id = documentSnaphot.id
          const lastName = documentSnaphot.get('lastName') as string

          const newUser: User = {
            avatarUrl,
            firstName,
            id,
            lastName,
          }

          newUsers.push(newUser)
        })

        setUsers(newUsers)
      })
  }, [user])

  const createUserInFirestore = async (userData: User) => {
    await firestore().collection('users').doc(userData.id).set({
      avatarUrl: userData.avatarUrl,
      firstName: userData.firstName,
      lastName: userData.lastName,
    })
  }

  return { createUserInFirestore, user, users }
}
