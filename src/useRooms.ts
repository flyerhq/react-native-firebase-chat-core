import firestore from '@react-native-firebase/firestore'
import * as React from 'react'

import { Room } from './types'
import { useFirebaseUser } from './useFirebaseUser'
import { processRoomsQuery } from './utils'

export const useRooms = () => {
  const [rooms, setRooms] = React.useState<Room[]>([])
  const { firebaseUser } = useFirebaseUser()

  React.useEffect(() => {
    if (!firebaseUser) {
      setRooms([])
      return
    }

    return firestore()
      .collection('rooms')
      .where('userIds', 'array-contains', firebaseUser.uid)
      .onSnapshot(async (query) => {
        const newRooms = await processRoomsQuery({ firebaseUser, query })

        setRooms(newRooms)
      })
  }, [firebaseUser])

  return { rooms }
}
