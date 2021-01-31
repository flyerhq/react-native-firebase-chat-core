export namespace MessageType {
  export type Any = File | Image | Text

  interface Base {
    authorId: string
    id: string
    status?: 'error' | 'read' | 'sending' | 'sent'
    timestamp?: number
    type: 'file' | 'image' | 'text'
  }

  export interface File extends Base {
    fileName: string
    mimeType?: string
    size: number
    type: 'file'
    url: string
  }

  export interface Image extends Base {
    height?: number
    imageName: string
    size: number
    type: 'image'
    url: string
    width?: number
  }

  export interface Text extends Base {
    previewData?: PreviewData
    text: string
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
  isGroup: boolean
  name?: string
  users: User[]
}

export interface User {
  avatarUrl?: string
  firstName: string
  id: string
  lastName: string
}
