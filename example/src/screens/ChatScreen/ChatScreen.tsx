import { Chat, SendImageCallback } from '@flyerhq/react-native-chat-ui'
import {
  useFirebaseUser,
  useMessages,
} from '@flyerhq/react-native-firebase-chat-core'
import storage from '@react-native-firebase/storage'
import { RouteProp } from '@react-navigation/native'
import React from 'react'
import ImagePicker from 'react-native-image-picker'
import { MainStackParamList } from 'src/types'

interface Props {
  route: RouteProp<MainStackParamList, 'Chat'>
}

const ChatScreen = ({ route }: Props) => {
  const { firebaseUser } = useFirebaseUser()
  const { messages, sendMessage } = useMessages(route.params.roomId)

  const handleAttachmentPress = (send: SendImageCallback) => {
    ImagePicker.showImagePicker(
      { maxWidth: 1440, noData: true, quality: 0.7 },
      async (response) => {
        if (response) {
          try {
            const fileName = response.uri.split('/').pop()
            const reference = storage().ref(fileName)
            await reference.putFile(response.uri)
            const url = await reference.getDownloadURL()
            send({
              height: response.height,
              url,
              width: response.width,
            })
          } catch {}
        }
      }
    )
  }

  return (
    <Chat
      messages={messages}
      onAttachmentPress={handleAttachmentPress}
      onSendPress={sendMessage}
      user={{ id: firebaseUser?.uid ?? '', name: '' }}
    />
  )
}

export default ChatScreen
