import firestore from '@react-native-firebase/firestore'
import * as React from 'react'

import { MessageType, Room } from './types'
import { useFirebaseUser } from './useFirebaseUser'

/** Returns a stream of messages from Firebase for a given room */
export const useMessages = (room: Room) => {
  const [messages, setMessages] = React.useState<MessageType.Any[]>([])
  const { firebaseUser } = useFirebaseUser()

  React.useEffect(() => {
    return firestore()
      .collection(`rooms/${room.id}/messages`)
      .orderBy('createdAt', 'desc')
      .onSnapshot((query) => {
        const newMessages: MessageType.Any[] = []

        query.forEach((doc) => {
          // Ignore `authorId`, `createdAt` and `updatedAt` types here, not provided by the Firebase library
          // type-coverage:ignore-next-line
          const { authorId, createdAt, updatedAt, ...rest } = doc.data()

          // type-coverage:ignore-next-line
          const author = room.users.find((u) => u.id === authorId) ?? {
            id: authorId as string,
          }

          newMessages.push({
            ...rest,
            author,
            // type-coverage:ignore-next-line
            createdAt: createdAt?.toMillis() ?? undefined,
            id: doc.id,
            // type-coverage:ignore-next-line
            updatedAt: updatedAt?.toMillis() ?? undefined,
          } as MessageType.Any)
        })

        setMessages(newMessages)
      })
  }, [room.id, room.users])

  /** Sends a message to the Firestore. Accepts any partial message. */
  const sendMessage = async (message: MessageType.PartialAny) => {
    if (!firebaseUser) return

    await firestore()
      .collection(`rooms/${room.id}/messages`)
      .add({
        ...message,
        authorId: firebaseUser.uid,
        createdAt: firestore.FieldValue.serverTimestamp(),
        updatedAt: firestore.FieldValue.serverTimestamp(),
      })
  }

  /** Updates a message in the Firestore. Accepts any message.
   * Message will probably be taken from the `useMessages` stream. */
  const updateMessage = async (message: MessageType.Any) => {
    if (!firebaseUser || message.author.id !== firebaseUser.uid) return

    const messageToSend: Partial<MessageType.Any> = {
      ...message,
    }

    delete messageToSend.author
    delete messageToSend.createdAt
    delete messageToSend.id

    await firestore()
      .collection(`rooms/${room.id}/messages`)
      .doc(message.id)
      .update({
        ...messageToSend,
        authorId: message.author.id,
        updatedAt: firestore.FieldValue.serverTimestamp(),
      })
  }

  return { messages, sendMessage, updateMessage }
}
