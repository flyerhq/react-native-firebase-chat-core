import { useActionSheet } from '@expo/react-native-action-sheet'
import getPath from '@flyerhq/react-native-android-uri-path'
import { Chat, MessageType } from '@flyerhq/react-native-chat-ui'
import {
  PreviewData,
  useFirebaseUser,
  useMessages,
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
  const { messages, sendMessage, updateMessage } = useMessages(
    route.params.roomId
  )
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

  const handleFilePress = async (file: MessageType.File) => {
    try {
      const uri = utils.FilePath.DOCUMENT_DIRECTORY + '/' + file.fileName
      const reference = storage().ref(file.fileName)
      await reference.writeToFile(uri)
      const path = Platform.OS === 'android' ? uri.replace('file://', '') : uri
      await FileViewer.open(path, { showOpenWithDialog: true })
    } catch {}
  }

  const handleFileSelection = async () => {
    try {
      const response = await DocumentPicker.pick({
        type: [DocumentPicker.types.allFiles],
      })
      setAttachmentUploading(true)
      const fileName = response.name
      const reference = storage().ref(fileName)
      await reference.putFile(getPath(response.uri))
      const uri = await reference.getDownloadURL()
      const message: MessageType.PartialFile = {
        fileName,
        mimeType: response.type,
        size: response.size,
        uri,
      }
      sendMessage(message)
      setAttachmentUploading(false)
    } catch (err) {
      setAttachmentUploading(false)
      if (!DocumentPicker.isCancel(err)) {
        // Handle user cancel
      }
    }
  }

  const handleImageSelection = () => {
    launchImageLibrary(
      {
        maxWidth: 1440,
        mediaType: 'photo',
        quality: 0.7,
      },
      async (response) => {
        if (response.uri) {
          setAttachmentUploading(true)
          const fileName = response.uri.split('/').pop()
          const reference = storage().ref(fileName)
          await reference.putFile(response.uri)
          const uri = await reference.getDownloadURL()
          const message: MessageType.PartialImage = {
            height: response.height,
            imageName: response.fileName ?? fileName ?? '🖼',
            size: response.fileSize ?? 0,
            uri,
            width: response.width,
          }
          sendMessage(message)
          setAttachmentUploading(false)
        }
      }
    )
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
      isAttachmentUploading={isAttachmentUploading}
      messages={messages}
      onAttachmentPress={handleAttachmentPress}
      onFilePress={handleFilePress}
      onPreviewDataFetched={handlePreviewDataFetched}
      onSendPress={sendMessage}
      user={{ id: firebaseUser?.uid ?? '' }}
    />
  )
}

export default ChatScreen
