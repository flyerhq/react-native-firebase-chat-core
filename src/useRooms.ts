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
          let imageUrl = (doc.get('imageUrl') as string | null) ?? undefined
          const isGroup = doc.get('isGroup') as boolean
          let name = (doc.get('name') as string | null) ?? undefined
          const userIds = doc.get('userIds') as string[]

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

          if (!isGroup) {
            const otherUser = users.find((u) => u.id !== user.uid)

            if (otherUser) {
              imageUrl = otherUser.avatarUrl
              name = `${otherUser.firstName} ${otherUser.lastName}`
            }
          }

          const newRoom: Room = {
            id: doc.id,
            imageUrl,
            isGroup,
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

    if (isChat(data)) {
      const existingRoom = rooms.find((room) => {
        if (room.isGroup) return false

        const userIds = room.users.map((u) => u.id)
        return userIds.includes(user.uid) && userIds.includes(data.otherUser.id)
      })

      if (existingRoom) {
        return existingRoom
      }
    }

    const userData = await firestore().collection('users').doc(user.uid).get()

    const avatarUrl = (userData.get('avatarUrl') as string | null) ?? undefined
    const firstName = userData.get('firstName') as string
    const lastName = userData.get('lastName') as string

    const localUser: User = {
      avatarUrl,
      firstName,
      id: userData.id,
      lastName,
    }

    const imageUrl = isChat(data) ? undefined : data.imageUrl
    const isGroup = !isChat(data)
    const name = isChat(data) ? undefined : data.name
    const users = [localUser].concat(
      isChat(data) ? data.otherUser : data.users.map((u) => u)
    )

    const room = await firestore()
      .collection('rooms')
      .add({
        imageUrl,
        isGroup,
        userIds: users.map((u) => u.id),
        name,
      })

    return {
      id: room.id,
      imageUrl,
      isGroup,
      name,
      users,
    } as Room
  }

  return { createRoom, rooms }
}
