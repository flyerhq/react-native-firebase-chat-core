import firestore from '@react-native-firebase/firestore'
import * as React from 'react'
import { Room, User } from './types'
import { useFirebaseUser } from './useFirebaseUser'

interface CreateChatData {
  otherUser: User
}

interface CreateGroupData {
  imageUrl?: string
  name: string
  users: User[]
}

type CreateRoomData = CreateChatData | CreateGroupData

export const useRooms = () => {
  const [rooms, setRooms] = React.useState<Room[]>([])
  const { user } = useFirebaseUser()

  React.useEffect(() => {
    if (!user) {
      setRooms([])
      return
    }

    return firestore()
      .collection('rooms')
      .where('userIds', 'array-contains', user.uid)
      .onSnapshot(async (querySnapshot) => {
        const promises = querySnapshot.docs.map(async (doc) => {
          const userIds = doc.get('userIds') as string[]

          if (!userIds) return Promise.reject('Room must have userIds field')

          let imageUrl = (doc.get('imageUrl') as string | null) ?? undefined
          let name = (doc.get('name') as string | null) ?? undefined

          const userPromises = userIds.map(async (userId) => {
            const userData = await firestore()
              .collection('users')
              .doc(userId)
              .get()

            const avatarUrl =
              (userData.get('avatarUrl') as string | null) ?? undefined
            const firstName = userData.get('firstName') as string
            const lastName = userData.get('lastName') as string

            const fetchedUser: User = {
              avatarUrl,
              firstName,
              id: userData.id,
              lastName,
            }

            return fetchedUser
          })

          const users = await Promise.all(userPromises)

          if (users.length === 2) {
            const otherUser = users.find((u) => u.id !== user.uid)

            imageUrl = otherUser?.avatarUrl
            name = `${otherUser?.firstName ?? ''} ${otherUser?.lastName ?? ''}`
          }

          const newRoom: Room = {
            id: doc.id,
            imageUrl,
            name,
            users,
          }

          return newRoom
        })

        const newRooms = await Promise.all(promises)
        setRooms(newRooms)
      })
  }, [user])

  const createRoom = async (data: CreateRoomData) => {
    if (!user) throw new Error('User is not authenticated')

    const isChat = (
      verifyData: CreateChatData | CreateGroupData
    ): verifyData is CreateChatData => {
      return (verifyData as CreateChatData).otherUser !== undefined
    }

    const room = await firestore()
      .collection('rooms')
      .add({
        imageUrl: isChat(data) ? undefined : data.imageUrl,
        userIds: [user.uid].concat(
          isChat(data) ? data.otherUser.id : data.users.map((u) => u.id)
        ),
        name: isChat(data) ? undefined : data.name,
      })

    return room
  }

  return { createRoom, rooms }
}
