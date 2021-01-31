import firestore from '@react-native-firebase/firestore'
import * as React from 'react'

import { User } from './types'
import { useFirebaseUser } from './useFirebaseUser'
import { processUserDocument } from './utils'

export const useUsers = () => {
  const [users, setUsers] = React.useState<User[]>([])
  const { firebaseUser } = useFirebaseUser()

  React.useEffect(() => {
    if (!firebaseUser) {
      setUsers([])
      return
    }

    return firestore()
      .collection('users')
      .onSnapshot((query) => {
        const newUsers: User[] = []

        query.forEach((doc) => {
          if (firebaseUser.uid === doc.id) return

          newUsers.push(processUserDocument(doc))
        })

        setUsers(newUsers)
      })
  }, [firebaseUser])

  return { users }
}
