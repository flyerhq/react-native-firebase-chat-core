import firestore from '@react-native-firebase/firestore'
import * as React from 'react'

import { User } from './types'
import { useFirebaseUser } from './useFirebaseUser'

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

          const data = doc.data()!

          const user: User = {
            createdAt: data.createdAt?.toMillis() ?? undefined,
            firstName: data.firstName ?? undefined,
            id: doc.id,
            imageUrl: data.imageUrl ?? undefined,
            lastName: data.lastName ?? undefined,
            lastSeen: data.lastSeen?.toMillis() ?? undefined,
            metadata: data.metadata ?? undefined,
            updatedAt: data.updatedAt?.toMillis() ?? undefined,
          }

          newUsers.push(user)
        })

        setUsers(newUsers)
      })
  }, [firebaseUser])

  return { users }
}
