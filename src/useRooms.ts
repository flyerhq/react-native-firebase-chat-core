import firestore from '@react-native-firebase/firestore'
import * as React from 'react'

import { Room, User } from './types'
import { useFirebaseUser } from './useFirebaseUser'
import { fetchUser, processRoomsQuery } from './utils'

export const useRooms = (orderByUpdatedAt?: boolean) => {
  const [rooms, setRooms] = React.useState<Room[]>([])
  const { firebaseUser } = useFirebaseUser()

  React.useEffect(() => {
    if (!firebaseUser) {
      setRooms([])
      return
    }

    const collection = orderByUpdatedAt
      ? firestore()
          .collection('rooms')
          .where('userIds', 'array-contains', firebaseUser.uid)
          .orderBy('updatedAt', 'desc')
      : firestore()
          .collection('rooms')
          .where('userIds', 'array-contains', firebaseUser.uid)

    return collection.onSnapshot(async (query) => {
      const newRooms = await processRoomsQuery({ firebaseUser, query })

      setRooms(newRooms)
    })
  }, [firebaseUser, orderByUpdatedAt])

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
        createdAt: firestore.FieldValue.serverTimestamp(),
        imageUrl,
        metadata,
        name,
        type: 'group',
        updatedAt: firestore.FieldValue.serverTimestamp(),
        userIds: roomUsers.map((u) => u.id),
        userRoles: roomUsers.reduce(
          (prev, curr) => ({ ...prev, [curr.id]: curr.role }),
          {}
        ),
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
        createdAt: firestore.FieldValue.serverTimestamp(),
        imageUrl: undefined,
        metadata,
        name: undefined,
        type: 'direct',
        updatedAt: firestore.FieldValue.serverTimestamp(),
        userIds: users.map((u) => u.id),
        userRoles: undefined,
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
