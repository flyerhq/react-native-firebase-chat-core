import firestore from '@react-native-firebase/firestore'
import * as React from 'react'

import { Room, User } from './types'
import { useFirebaseUser } from './useFirebaseUser'
import { fetchUser, processRoomsQuery } from './utils'

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

  const createGroupRoom = async ({
    imageUrl,
    metadata,
    name,
    users,
  }: {
    imageUrl?: string
    metadata?: Record<string, any>
    name: string
    users: User[]
  }) => {
    if (!firebaseUser) return

    const currentUser = await fetchUser(firebaseUser.uid)

    const roomUsers = [currentUser].concat(users)

    const room = await firestore()
      .collection('rooms')
      .add({
        imageUrl,
        metadata,
        name,
        type: 'group',
        userIds: roomUsers.map((u) => u.id),
      })

    return {
      id: room.id,
      imageUrl,
      metadata,
      name,
      type: 'group',
      users: roomUsers,
    } as Room
  }

  const createRoom = async (
    otherUser: User,
    metadata?: Record<string, any>
  ) => {
    if (!firebaseUser) return

    const query = await firestore()
      .collection('rooms')
      .where('userIds', 'array-contains', firebaseUser.uid)
      .get()

    const allRooms = await processRoomsQuery({ firebaseUser, query })

    const existingRoom = allRooms.find((room) => {
      if (room.type === 'group') return false

      const userIds = room.users.map((u) => u.id)
      return (
        userIds.includes(firebaseUser.uid) && userIds.includes(otherUser.id)
      )
    })

    if (existingRoom) {
      return existingRoom
    }

    const currentUser = await fetchUser(firebaseUser.uid)

    const users = [currentUser].concat(otherUser)

    const room = await firestore()
      .collection('rooms')
      .add({
        imageUrl: undefined,
        metadata,
        name: undefined,
        type: 'direct',
        userIds: users.map((u) => u.id),
      })

    return {
      id: room.id,
      metadata,
      type: 'direct',
      users,
    } as Room
  }

  return { createGroupRoom, createRoom, rooms }
}
