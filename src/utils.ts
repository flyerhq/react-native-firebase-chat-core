import { FirebaseAuthTypes } from '@react-native-firebase/auth'
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore'

import { Room, User } from './types'

export const createGroupRoom = async ({
  firebaseUser,
  imageUrl,
  name,
  users,
}: {
  firebaseUser: FirebaseAuthTypes.User
  imageUrl?: string
  name: string
  users: User[]
}) => {
  const currentUser = await fetchUser(firebaseUser.uid)

  const roomUsers = [currentUser].concat(users)

  const room = await firestore()
    .collection('rooms')
    .add({
      imageUrl,
      name,
      type: 'group',
      userIds: roomUsers.map((u) => u.id),
    })

  return {
    id: room.id,
    imageUrl,
    name,
    type: 'group',
    users: roomUsers,
  } as Room
}

export const createRoom = async ({
  firebaseUser,
  otherUser,
}: {
  firebaseUser: FirebaseAuthTypes.User
  otherUser: User
}) => {
  const query = await firestore()
    .collection('rooms')
    .where('userIds', 'array-contains', firebaseUser.uid)
    .get()

  const rooms = await processRoomsQuery({ firebaseUser, query })

  const existingRoom = rooms.find((room) => {
    if (room.type === 'group') return false

    const userIds = room.users.map((u) => u.id)
    return userIds.includes(firebaseUser.uid) && userIds.includes(otherUser.id)
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
      name: undefined,
      type: 'direct',
      userIds: users.map((u) => u.id),
    })

  return {
    id: room.id,
    type: 'direct',
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
    let name = (doc.get('name') as string | null) ?? undefined
    const type = doc.get('type') as Room['type']
    const userIds = doc.get('userIds') as string[]
    const users = await Promise.all(userIds.map((userId) => fetchUser(userId)))

    if (type === 'direct') {
      const otherUser = users.find((u) => u.id !== firebaseUser.uid)

      if (otherUser) {
        imageUrl = otherUser.avatarUrl
        name = `${otherUser.firstName} ${otherUser.lastName}`
      }
    }

    const room: Room = {
      id: doc.id,
      imageUrl,
      name,
      type,
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
