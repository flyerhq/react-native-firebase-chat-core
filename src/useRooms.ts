import firestore from '@react-native-firebase/firestore'
import * as React from 'react'

import { ROOMS_COLLECTION_NAME } from '.'
import { Room, User } from './types'
import { useFirebaseUser } from './useFirebaseUser'
import { fetchUser, processRoomsQuery } from './utils'

/** Returns a stream of rooms from Firebase. Only rooms where current
 * logged in user exist are returned. `orderByUpdatedAt` is used in case
 * you want to have last modified rooms on top, there are a couple
 * of things you will need to do though:
 * 1) Make sure `updatedAt` exists on all rooms
 * 2) Write a Cloud Function which will update `updatedAt` of the room
 * when the room changes or new messages come in
 * 3) Create an Index (Firestore Database -> Indexes tab) where collection ID
 * is `rooms`, field indexed are `userIds` (type Arrays) and `updatedAt`
 * (type Descending), query scope is `Collection` */
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
          .collection(ROOMS_COLLECTION_NAME)
          .where('userIds', 'array-contains', firebaseUser.uid)
          .orderBy('updatedAt', 'desc')
      : firestore()
          .collection(ROOMS_COLLECTION_NAME)
          .where('userIds', 'array-contains', firebaseUser.uid)

    return collection.onSnapshot(async (query) => {
      const newRooms = await processRoomsQuery({ firebaseUser, query })

      setRooms(newRooms)
    })
  }, [firebaseUser, orderByUpdatedAt])

  /** Creates a chat group room with `users`. Creator is automatically
   * added to the group. `name` is required and will be used as
   * a group name. Add an optional `imageUrl` that will be a group avatar
   * and `metadata` for any additional custom data. */
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
      .collection(ROOMS_COLLECTION_NAME)
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

  /** Creates a direct chat for 2 people. Add `metadata` for any additional custom data. */
  const createRoom = async (
    otherUser: User,
    metadata?: Record<string, any>
  ) => {
    if (!firebaseUser) return

    const query = await firestore()
      .collection(ROOMS_COLLECTION_NAME)
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
      .collection(ROOMS_COLLECTION_NAME)
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
