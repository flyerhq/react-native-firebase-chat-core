import firestore from '@react-native-firebase/firestore'
import * as React from 'react'
import { Message } from './types'

export const useMessages = (roomId: string) => {
  const [messages, setMessages] = React.useState<Message[]>([])

  React.useEffect(() => {
    return firestore()
      .collection(`rooms/${roomId}/messages`)
      .orderBy('timestamp', 'desc')
      .onSnapshot((querySnapshot) => {
        const newMessages: Message[] = []

        querySnapshot.forEach((documentSnaphot) => {
          const { timestamp, ...rest } = documentSnaphot.data()

          newMessages.push({
            ...rest,
            timestamp: timestamp
              ? Math.floor(timestamp.toMillis() / 1000)
              : undefined,
            id: documentSnaphot.id,
          } as Message)
        })

        setMessages(newMessages)
      })
  }, [roomId])

  const sendMessage = async (message: Message) => {
    await firestore().collection(`rooms/${roomId}/messages`).add({
      authorId: message.authorId,
      text: message.text,
      timestamp: firestore.FieldValue.serverTimestamp(),
    })
  }

  return { messages, sendMessage }
}
