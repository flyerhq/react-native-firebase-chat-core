import firestore from '@react-native-firebase/firestore'
import * as React from 'react'
import { MessageType } from './types'

export const useMessages = (roomId: string) => {
  const [messages, setMessages] = React.useState<MessageType.Any[]>([])

  React.useEffect(() => {
    return firestore()
      .collection(`rooms/${roomId}/messages`)
      .orderBy('timestamp', 'desc')
      .onSnapshot((query) => {
        const newMessages: MessageType.Any[] = []

        query.forEach((doc) => {
          const { timestamp, ...rest } = doc.data()

          newMessages.push({
            ...rest,
            timestamp: timestamp
              ? Math.floor(timestamp.toMillis() / 1000)
              : undefined,
            id: doc.id,
          } as MessageType.Any)
        })

        setMessages(newMessages)
      })
  }, [roomId])

  const sendMessage = async (message: MessageType.Any) => {
    delete message.id

    await firestore()
      .collection(`rooms/${roomId}/messages`)
      .add({
        ...message,
        timestamp: firestore.FieldValue.serverTimestamp(),
      })
  }

  return { messages, sendMessage }
}
