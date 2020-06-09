import auth, { FirebaseAuthTypes } from '@react-native-firebase/auth'
import firestore from '@react-native-firebase/firestore'
import * as React from 'react'
import { Room, User } from './types'

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
  const [user, setUser] = React.useState<FirebaseAuthTypes.User | null>(null)

  React.useEffect(() => {
    return auth().onAuthStateChanged(setUser)
  }, [])

  React.useEffect(() => {
    if (!user) {
      setRooms([])
      return
    }

    return firestore()
      .collection('rooms')
      .onSnapshot((querySnapshot) => {
        const newRooms: Room[] = []

        querySnapshot.forEach((documentSnaphot) => {
          const users = (documentSnaphot.get('users') as unknown) as User[]

          if (!users) return

          const id = documentSnaphot.id
          let imageUrl =
            (documentSnaphot.get('imageUrl') as string | null) ?? undefined
          let name = (documentSnaphot.get('name') as string | null) ?? undefined

          if (users.length === 2) {
            const otherUser = users.find((u) => u.id !== user.uid)

            if (!otherUser) return

            imageUrl = otherUser.avatarUrl
            name = `${otherUser.firstName} ${otherUser.lastName}`
          }

          const newRoom: Room = {
            id,
            imageUrl,
            name,
            users,
          }

          newRooms.push(newRoom)
        })

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

    const userData = await firestore().collection('users').doc(user.uid).get()
    const avatarUrl = (userData.get('avatarUrl') as string | null) ?? undefined
    const firstName = userData.get('firstName') as string
    const id = user.uid
    const lastName = userData.get('lastName') as string

    const currentUser: User = {
      avatarUrl,
      firstName,
      id,
      lastName,
    }

    const room = await firestore()
      .collection('rooms')
      .add({
        imageUrl: isChat(data) ? undefined : data.imageUrl,
        users: [currentUser].concat(isChat(data) ? data.otherUser : data.users),
        name: isChat(data) ? undefined : data.name,
      })

    return room
  }

  return { createRoom, rooms, user }
}
