import firestore from '@react-native-firebase/firestore'
import * as React from 'react'

import { Room } from './types'
import { useFirebaseUser } from './useFirebaseUser'
import { processRoomDocument } from './utils'

export const useRoom = (initialRoom: Room) => {
  const [room, setRoom] = React.useState(initialRoom)
  const { firebaseUser } = useFirebaseUser()

  React.useEffect(() => {
    if (!firebaseUser) return

    return firestore()
      .collection('rooms')
      .doc(initialRoom.id)
      .onSnapshot(async (doc) => {
        const newRoom = await processRoomDocument({ doc, firebaseUser })

        setRoom(newRoom)
      })
  }, [firebaseUser, initialRoom.id])

  return { room }
}
