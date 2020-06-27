import { FirebaseAuthTypes } from '@react-native-firebase/auth'
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore'
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

export const createRoom = async ({
  firebaseUser,
  roomData,
}: {
  firebaseUser: FirebaseAuthTypes.User
  roomData: CreateRoomData
}) => {
  const isChat = (
    verifyData: CreateChatData | CreateGroupData
  ): verifyData is CreateChatData => {
    return (verifyData as CreateChatData).otherUser !== undefined
  }

  if (isChat(roomData)) {
    const query = await firestore()
      .collection('rooms')
      .where('userIds', 'array-contains', firebaseUser.uid)
      .get()

    const rooms = await processRoomsQuery({ firebaseUser, query })

    const existingRoom = rooms.find((room) => {
      if (room.isGroup) return false

      const userIds = room.users.map((u) => u.id)
      return (
        userIds.includes(firebaseUser.uid) &&
        userIds.includes(roomData.otherUser.id)
      )
    })

    if (existingRoom) {
      return existingRoom
    }
  }

  const currentUser = await fetchUser(firebaseUser.uid)

  const imageUrl = isChat(roomData) ? undefined : roomData.imageUrl
  const isGroup = !isChat(roomData)
  const name = isChat(roomData) ? undefined : roomData.name
  const users = [currentUser].concat(
    isChat(roomData) ? roomData.otherUser : roomData.users.map((u) => u)
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

export const createUserInFirestore = async (user: User) => {
  await firestore().collection('users').doc(user.id).set({
    avatarUrl: user.avatarUrl,
    firstName: user.firstName,
    lastName: user.lastName,
  })
}

export const fetchUser = async (userId: string) => {
  const doc = await firestore().collection('users').doc(userId).get()

  return processUserDocument(doc)
}

export const processRoomsQuery = async ({
  firebaseUser,
  query,
}: {
  firebaseUser: FirebaseAuthTypes.User
  query: FirebaseFirestoreTypes.QuerySnapshot
}) => {
  const promises = query.docs.map(async (doc) => {
    let imageUrl = (doc.get('imageUrl') as string | null) ?? undefined
    const isGroup = doc.get('isGroup') as boolean
    let name = (doc.get('name') as string | null) ?? undefined
    const userIds = doc.get('userIds') as string[]
    const users = await Promise.all(userIds.map((userId) => fetchUser(userId)))

    if (!isGroup) {
      const otherUser = users.find((u) => u.id !== firebaseUser.uid)

      if (otherUser) {
        imageUrl = otherUser.avatarUrl
        name = `${otherUser.firstName} ${otherUser.lastName}`
      }
    }

    const room: Room = {
      id: doc.id,
      imageUrl,
      isGroup,
      name,
      users,
    }

    return room
  })

  return await Promise.all(promises)
}

export const processUserDocument = (
  doc: FirebaseFirestoreTypes.DocumentSnapshot
) => {
  const avatarUrl = (doc.get('avatarUrl') as string | null) ?? undefined
  const firstName = doc.get('firstName') as string
  const lastName = doc.get('lastName') as string

  const user: User = {
    avatarUrl,
    firstName,
    id: doc.id,
    lastName,
  }

  return user
}
