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
    // Ignore types here, not provided by the Firebase library
    // type-coverage:ignore-next-line
    createdAt: data.createdAt?.toMillis() ?? undefined,
    // type-coverage:ignore-next-line
    firstName: data.firstName ?? undefined,
    id: doc.id,
    // type-coverage:ignore-next-line
    imageUrl: data.imageUrl ?? undefined,
    // type-coverage:ignore-next-line
    lastName: data.lastName ?? undefined,
    // type-coverage:ignore-next-line
    lastSeen: data.lastSeen?.toMillis() ?? undefined,
    // type-coverage:ignore-next-line
    metadata: data.metadata ?? undefined,
    role,
    // type-coverage:ignore-next-line
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
  doc:
    | FirebaseFirestoreTypes.DocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
    | FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData>
  firebaseUser: FirebaseAuthTypes.User
}) => {
  const data = doc.data()!

  // Ignore types here, not provided by the Firebase library
  // type-coverage:ignore-next-line
  const createdAt = data.createdAt?.toMillis() ?? undefined
  const id = doc.id
  // type-coverage:ignore-next-line
  const updatedAt = data.updatedAt?.toMillis() ?? undefined

  // type-coverage:ignore-next-line
  let imageUrl = data.imageUrl ?? undefined
  let lastMessages
  // type-coverage:ignore-next-line
  let name = data.name ?? undefined
  // type-coverage:ignore-next-line
  const metadata = data.metadata ?? undefined
  // type-coverage:ignore-next-line
  const type = data.type as Room['type']
  // type-coverage:ignore-next-line
  const userIds = data.userIds as string[]
  const userRoles =
    // type-coverage:ignore-next-line
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

  // type-coverage:ignore-next-line
  if (data.lastMessages && data.lastMessages instanceof Array) {
    // type-coverage:ignore-next-line
    lastMessages = data.lastMessages.map((lm: any) => {
      // type-coverage:ignore-next-line
      const author = users.find((u) => u.id === lm.authorId) ?? {
        // type-coverage:ignore-next-line
        id: lm.authorId as string,
      }

      return {
        // type-coverage:ignore-next-line
        ...(lm ?? {}),
        author,
        // type-coverage:ignore-next-line
        createdAt: lm.createdAt?.toMillis() ?? undefined,
        // type-coverage:ignore-next-line
        id: lm.id ?? '',
        // type-coverage:ignore-next-line
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
