import { useActionSheet } from '@expo/react-native-action-sheet'
import getPath from '@flyerhq/react-native-android-uri-path'
import { Chat, MessageType } from '@flyerhq/react-native-chat-ui'
import {
  PreviewData,
  useFirebaseUser,
  useMessages,
  useRoom,
} from '@flyerhq/react-native-firebase-chat-core'
import { utils } from '@react-native-firebase/app'
import storage from '@react-native-firebase/storage'
import { RouteProp } from '@react-navigation/native'
import React, { useState } from 'react'
import { Platform } from 'react-native'
import DocumentPicker from 'react-native-document-picker'
import FileViewer from 'react-native-file-viewer'
import { launchImageLibrary } from 'react-native-image-picker'
import { MainStackParamList } from 'src/types'

interface Props {
  route: RouteProp<MainStackParamList, 'Chat'>
}

const ChatScreen = ({ route }: Props) => {
  const { firebaseUser } = useFirebaseUser()
  const { room } = useRoom(route.params.room)
  const { messages, sendMessage, updateMessage } = useMessages(room)
  const [isAttachmentUploading, setAttachmentUploading] = useState(false)
  const { showActionSheetWithOptions } = useActionSheet()

  const handleAttachmentPress = () => {
    showActionSheetWithOptions(
      {
        options: ['Photo', 'File', 'Cancel'],
        cancelButtonIndex: 2,
      },
      (buttonIndex) => {
        switch (buttonIndex) {
          case 0:
            handleImageSelection()
            break
          case 1:
            handleFileSelection()
            break
        }
      }
    )
  }

  const handleFileSelection = async () => {
    try {
      const response = await DocumentPicker.pickSingle({
        type: [DocumentPicker.types.allFiles],
      })
      setAttachmentUploading(true)
      const name = response.name
      const reference = storage().ref(name)
      await reference.putFile(getPath(response.uri))
      const uri = await reference.getDownloadURL()
      const message: MessageType.PartialFile = {
        mimeType: response.type ?? undefined,
        name,
        size: response.size ?? 0,
        type: 'file',
        uri,
      }
      sendMessage(message)
      setAttachmentUploading(false)
    } catch (err) {
      setAttachmentUploading(false)
    }
  }

  const handleImageSelection = () => {
    launchImageLibrary(
      {
        maxWidth: 1440,
        mediaType: 'photo',
        quality: 0.7,
      },
      async ({ assets }) => {
        const response = assets?.[0]

        if (response?.uri) {
          setAttachmentUploading(true)
          const name = response.uri?.split('/').pop()
          const reference = storage().ref(name)
          await reference.putFile(response.uri)
          const uri = await reference.getDownloadURL()
          const message: MessageType.PartialImage = {
            height: response.height,
            name: response.fileName ?? name ?? '🖼',
            size: response.fileSize ?? 0,
            type: 'image',
            uri,
            width: response.width,
          }
          sendMessage(message)
          setAttachmentUploading(false)
        }
      }
    )
  }

  const handleMessagePress = async (message: MessageType.Any) => {
    if (message.type === 'file') {
      try {
        const uri = utils.FilePath.DOCUMENT_DIRECTORY + '/' + message.name
        const reference = storage().ref(message.name)
        await reference.writeToFile(uri)
        const path =
          Platform.OS === 'android' ? uri.replace('file://', '') : uri
        await FileViewer.open(path, { showOpenWithDialog: true })
      } catch {}
    }
  }

  const handlePreviewDataFetched = ({
    message,
    previewData,
  }: {
    message: MessageType.Text
    previewData: PreviewData
  }) => {
    const newMessage: MessageType.Text = { ...message, previewData }
    updateMessage(newMessage)
  }

  return (
    <Chat
      enableAnimation
      isAttachmentUploading={isAttachmentUploading}
      messages={messages}
      onAttachmentPress={handleAttachmentPress}
      onMessagePress={handleMessagePress}
      onPreviewDataFetched={handlePreviewDataFetched}
      onSendPress={sendMessage}
      user={{ id: firebaseUser?.uid ?? '' }}
    />
  )
}

export default ChatScreen
