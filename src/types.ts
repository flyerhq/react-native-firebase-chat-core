// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MessageType {
  export type Any = File | Image | Text

  interface Base {
    authorId: string
    id: string
    timestamp: number
  }

  export interface File extends Base {
    mimeType?: string
    name: string
    size: number
    type: 'file'
    url: string
  }

  export interface Image extends Base {
    height?: number
    type: 'image'
    url: string
    width?: number
  }

  export interface Text extends Base {
    text: string
    type: 'text'
  }
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
