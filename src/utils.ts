import { FirebaseAuthTypes } from '@react-native-firebase/auth'
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore'

import { Room, User } from './types'

export const createUserInFirestore = async (user: User) => {
  await firestore().collection('users').doc(user.id).set({
    createdAt: firestore.FieldValue.serverTimestamp(),
    firstName: user.firstName,
    imageUrl: user.imageUrl,
    lastName: user.lastName,
    lastSeen: user.lastSeen,
    metadata: user.metadata,
    role: user.role,
    updatedAt: firestore.FieldValue.serverTimestamp(),
  })
}

export const deleteUserFromFirestore = async (userId: string) => {
  await firestore().collection('users').doc(userId).delete()
}

export const fetchUser = async (userId: string, role?: User['role']) => {
  const doc = await firestore().collection('users').doc(userId).get()

  const data = doc.data()!

  const user: User = {
    createdAt: data.createdAt?.toMillis() ?? undefined,
    firstName: data.firstName ?? undefined,
    id: doc.id,
    imageUrl: data.imageUrl ?? undefined,
    lastName: data.lastName ?? undefined,
    lastSeen: data.lastSeen?.toMillis() ?? undefined,
    metadata: data.metadata ?? undefined,
    role,
    updatedAt: data.updatedAt?.toMillis() ?? undefined,
  }

  return user
}

export const processRoomsQuery = async ({
  firebaseUser,
  query,
}: {
  firebaseUser: FirebaseAuthTypes.User
  query: FirebaseFirestoreTypes.QuerySnapshot
}) => {
  const promises = query.docs.map(async (doc) =>
    processRoomDocument({ doc, firebaseUser })
  )

  return await Promise.all(promises)
}

export const processRoomDocument = async ({
  doc,
  firebaseUser,
}: {
  doc: FirebaseFirestoreTypes.DocumentData
  firebaseUser: FirebaseAuthTypes.User
}) => {
  const data = doc.data()!

  const createdAt = data.createdAt?.toMillis() ?? undefined
  const id = doc.id
  const updatedAt = data.updatedAt?.toMillis() ?? undefined

  let imageUrl = data.imageUrl ?? undefined
  let lastMessages
  let name = data.name ?? undefined
  const metadata = data.metadata ?? undefined
  const type = data.type as Room['type']
  const userIds = data.userIds as string[]
  const userRoles =
    (data.userRoles as Record<string, User['role']>) ?? undefined

  const users = await Promise.all(
    userIds.map((userId) => fetchUser(userId, userRoles?.[userId]))
  )

  if (type === 'direct') {
    const otherUser = users.find((u) => u.id !== firebaseUser.uid)

    if (otherUser) {
      imageUrl = otherUser.imageUrl
      name = `${otherUser.firstName ?? ''} ${otherUser.lastName ?? ''}`.trim()
    }
  }

  if (data.lastMessages && data.lastMessages instanceof Array) {
    lastMessages = data.lastMessages.map((lm: any) => {
      const author = users.find((u) => u.id === lm.authorId) ?? {
        id: lm.authorId as string,
      }

      return {
        ...(lm ?? {}),
        author,
        createdAt: lm.createdAt?.toMillis() ?? undefined,
        id: lm.id ?? '',
        updatedAt: lm.updatedAt?.toMillis() ?? undefined,
      }
    })
  }

  const room: Room = {
    createdAt,
    id,
    imageUrl,
    lastMessages,
    metadata,
    name,
    type,
    updatedAt,
    users,
  }

  return room
}
