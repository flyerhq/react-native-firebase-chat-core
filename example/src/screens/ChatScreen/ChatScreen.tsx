import { useActionSheet } from '@expo/react-native-action-sheet'
import {
  Chat,
  MessageType,
  SendAttachmentCallback,
} from '@flyerhq/react-native-chat-ui'
import {
  useFirebaseUser,
  useMessages,
} from '@flyerhq/react-native-firebase-chat-core'
import firebase from '@react-native-firebase/app'
import storage from '@react-native-firebase/storage'
import { RouteProp } from '@react-navigation/native'
import React from 'react'
import { Platform } from 'react-native'
import DocumentPicker from 'react-native-document-picker'
import FileViewer from 'react-native-file-viewer'
import ImagePicker from 'react-native-image-picker'
import { MainStackParamList } from 'src/types'

interface Props {
  route: RouteProp<MainStackParamList, 'Chat'>
}

const ChatScreen = ({ route }: Props) => {
  const { firebaseUser } = useFirebaseUser()
  const { messages, sendMessage } = useMessages(route.params.roomId)
  const { showActionSheetWithOptions } = useActionSheet()

  const handleAttachmentPress = (sendAttachment: SendAttachmentCallback) => {
    showActionSheetWithOptions(
      {
        options: ['Photo', 'File', 'Cancel'],
        cancelButtonIndex: 2,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            handleImageSelection(sendAttachment)
            break
          case 1:
            handleFileSelection(sendAttachment)
            break
        }
      }
    )
  }

  const handleFilePress = async (file: MessageType.File) => {
    try {
      const uri = firebase.utils.FilePath.DOCUMENT_DIRECTORY + file.name
      const reference = storage().ref(file.name)
      await reference.writeToFile(uri)
      const fileUri =
        Platform.OS === 'android' ? uri.replace('file://', '') : uri
      await FileViewer.open(fileUri, { showOpenWithDialog: true })
    } catch {}
  }

  const handleFileSelection = async (
    sendAttachment: SendAttachmentCallback
  ) => {
    try {
      const response = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      })
      const fileName = response.name
      const reference = storage().ref(fileName)
      // NOTE: File upload currently is not working for Android
      await reference.putFile(response.uri)
      const url = await reference.getDownloadURL()
      sendAttachment({
        mimeType: response.type,
        name: response.name,
        size: response.size,
        url,
      })
    } catch (err) {
      if (!DocumentPicker.isCancel(err)) {
        // Handle user cancel
      }
    }
  }

  const handleImageSelection = (sendAttachment: SendAttachmentCallback) => {
    ImagePicker.showImagePicker(
      { maxWidth: 1440, noData: true, quality: 0.7 },
      async (response) => {
        if (response) {
          try {
            const fileName = response.uri.split('/').pop()
            const reference = storage().ref(fileName)
            await reference.putFile(response.uri)
            const url = await reference.getDownloadURL()
            sendAttachment({
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
      onFilePress={handleFilePress}
      onSendPress={sendMessage}
      user={{ id: firebaseUser?.uid ?? '', name: '' }}
    />
  )
}

export default ChatScreen
