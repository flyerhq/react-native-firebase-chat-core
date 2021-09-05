import { FirebaseAuthTypes } from '@react-native-firebase/auth'
import firestore, {
  FirebaseFirestoreTypes,
} from '@react-native-firebase/firestore'

import { Room, User } from './types'

export const createUserInFirestore = async (user: User) => {
  await firestore().collection('users').doc(user.id).set({
    firstName: user.firstName,
    imageUrl: user.imageUrl,
    lastName: user.lastName,
  })
}

export const deleteUserFromFirestore = async (userId: string) => {
  await firestore().collection('users').doc(userId).delete()
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
    let metadata =
      (doc.get('metadata') as Record<string, any> | null) ?? undefined
    let name = (doc.get('name') as string | null) ?? undefined
    const type = doc.get('type') as Room['type']
    const userIds = doc.get('userIds') as string[]
    const users = await Promise.all(userIds.map((userId) => fetchUser(userId)))

    if (type === 'direct') {
      const otherUser = users.find((u) => u.id !== firebaseUser.uid)

      if (otherUser) {
        imageUrl = otherUser.imageUrl
        name = `${otherUser.firstName ?? ''} ${otherUser.lastName ?? ''}`.trim()
      }
    }

    const room: Room = {
      id: doc.id,
      imageUrl,
      metadata,
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
  const imageUrl = (doc.get('imageUrl') as string | null) ?? undefined
  const firstName = doc.get('firstName') as string
  const lastName = doc.get('lastName') as string

  const user: User = {
    firstName,
    id: doc.id,
    imageUrl,
    lastName,
  }

  return user
}
