import firestore from '@react-native-firebase/firestore'
import * as React from 'react'

import { MessageType } from './types'
import { useFirebaseUser } from './useFirebaseUser'

export const useMessages = (roomId: string) => {
  const [messages, setMessages] = React.useState<MessageType.Any[]>([])
  const { firebaseUser } = useFirebaseUser()

  React.useEffect(() => {
    return firestore()
      .collection(`rooms/${roomId}/messages`)
      .orderBy('timestamp', 'desc')
      .onSnapshot((query) => {
        const newMessages: MessageType.Any[] = []

        query.forEach((doc) => {
          // Ignore timestamp types here, not provided by the Firebase library
          // type-coverage:ignore-next-line
          const { timestamp, ...rest } = doc.data()

          newMessages.push({
            ...rest,
            // type-coverage:ignore-next-line
            timestamp: timestamp
              ? // type-coverage:ignore-next-line
                Math.floor(timestamp.toMillis() / 1000)
              : undefined,
            id: doc.id,
          } as MessageType.Any)
        })

        setMessages(newMessages)
      })
  }, [roomId])

  const sendMessage = async (message: MessageType.PartialAny) => {
    if (!firebaseUser) return

    let type: 'file' | 'image' | 'text' | undefined

    if (message.hasOwnProperty('text')) {
      type = 'text'
    } else if (message.hasOwnProperty('imageName')) {
      type = 'image'
    } else if (message.hasOwnProperty('fileName')) {
      type = 'file'
    }

    await firestore()
      .collection(`rooms/${roomId}/messages`)
      .add({
        ...message,
        authorId: firebaseUser.uid,
        timestamp: firestore.FieldValue.serverTimestamp(),
        type,
      })
  }

  const updateMessage = async (message: MessageType.Any) => {
    if (!firebaseUser || message.authorId !== firebaseUser.uid) return

    const messageWithoutIdAndTimestamp: Partial<MessageType.Any> = {
      ...message,
    }
    delete messageWithoutIdAndTimestamp.id
    delete messageWithoutIdAndTimestamp.timestamp

    await firestore()
      .collection(`rooms/${roomId}/messages`)
      .doc(message.id)
      .update({ ...messageWithoutIdAndTimestamp })
  }

  return { messages, sendMessage, updateMessage }
}
