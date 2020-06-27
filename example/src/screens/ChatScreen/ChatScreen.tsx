import { Chat } from '@flyerhq/react-native-chat-ui'
import {
  useFirebaseUser,
  useMessages,
} from '@flyerhq/react-native-firebase-chat-core'
import { RouteProp } from '@react-navigation/native'
import React from 'react'
import { MainStackParamList } from 'src/types'

interface Props {
  route: RouteProp<MainStackParamList, 'Chat'>
}

const ChatScreen = ({ route }: Props) => {
  const { firebaseUser } = useFirebaseUser()
  const { messages, sendMessage } = useMessages(route.params.roomId)

  return (
    <Chat
      messages={messages}
      onSendPress={sendMessage}
      user={{ id: firebaseUser?.uid ?? '', name: '' }}
    />
  )
}

export default ChatScreen
