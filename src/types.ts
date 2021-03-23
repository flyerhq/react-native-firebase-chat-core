export namespace MessageType {
  export type Any = File | Image | Text
  export type PartialAny = PartialFile | PartialImage | PartialText

  interface Base {
    authorId: string
    id: string
    status?: 'delivered' | 'error' | 'read' | 'sending'
    timestamp?: number
    type: 'file' | 'image' | 'text'
  }

  export interface PartialFile {
    fileName: string
    mimeType?: string
    size: number
    uri: string
  }

  export interface File extends Base, PartialFile {
    type: 'file'
  }

  export interface PartialImage {
    height?: number
    imageName: string
    size: number
    uri: string
    width?: number
  }

  export interface Image extends Base, PartialImage {
    type: 'image'
  }

  export interface PartialText {
    previewData?: PreviewData
    text: string
  }

  export interface Text extends Base, PartialText {
    type: 'text'
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
  id: string
  imageUrl?: string
  name?: string
  type: 'direct' | 'group'
  users: User[]
}

export interface User {
  avatarUrl?: string
  firstName?: string
  id: string
  lastName?: string
}
