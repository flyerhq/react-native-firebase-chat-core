import { ImageURISource } from 'react-native'

/** Interface that represents the chat config. Can be used for setting custom names
 * for rooms and users collections. Call `setConfig` before doing anything else if
 * you want to change the default collection names. When using custom names don't forget
 * to update your security rules and indexes. */
export interface FirebaseChatCoreConfig {
  roomsCollectionName: string
  usersCollectionName: string
}

export namespace MessageType {
  export type Any = Custom | File | Image | Text | Unsupported
  export type PartialAny =
    | PartialCustom
    | PartialFile
    | PartialImage
    | PartialText

  interface Base {
    author: User
    createdAt?: number
    id: string
    metadata?: Record<string, any>
    roomId?: string
    status?: 'delivered' | 'error' | 'seen' | 'sending' | 'sent'
    type: 'custom' | 'file' | 'image' | 'text' | 'unsupported'
    updatedAt?: number
  }

  export interface PartialCustom extends Base {
    metadata?: Record<string, any>
    type: 'custom'
  }

  export interface Custom extends Base, PartialCustom {
    type: 'custom'
  }

  export interface PartialFile {
    metadata?: Record<string, any>
    mimeType?: string
    name: string
    size: number
    type: 'file'
    uri: string
  }

  export interface File extends Base, PartialFile {
    type: 'file'
  }

  export interface PartialImage {
    height?: number
    metadata?: Record<string, any>
    name: string
    size: number
    type: 'image'
    uri: string
    width?: number
  }

  export interface Image extends Base, PartialImage {
    type: 'image'
  }

  export interface PartialText {
    metadata?: Record<string, any>
    previewData?: PreviewData
    text: string
    type: 'text'
  }

  export interface Text extends Base, PartialText {
    type: 'text'
  }

  export interface Unsupported extends Base {
    type: 'unsupported'
  }
}

export interface PreviewData {
  description?: string
  image?: PreviewDataImage
  link?: string
  title?: string
}

export interface PreviewDataImage {
  height: number
  url: string
  width: number
}

export interface Room {
  createdAt?: number
  id: string
  imageUrl?: ImageURISource['uri']
  lastMessages?: MessageType.Any[]
  metadata?: Record<string, any>
  name?: string
  type: 'channel' | 'direct' | 'group' | 'unsupported'
  updatedAt?: number
  users: User[]
}

export interface User {
  createdAt?: number
  firstName?: string
  id: string
  imageUrl?: ImageURISource['uri']
  lastName?: string
  lastSeen?: number
  metadata?: Record<string, any>
  role?: 'admin' | 'agent' | 'moderator' | 'user'
  updatedAt?: number
}
