// eslint-disable-next-line @typescript-eslint/no-namespace
export namespace MessageType {
  export type Any = Image | Text

  interface Base {
    authorId: string
    id: string
    timestamp: number
  }

  export interface Image extends Base {
    height?: number
    imageUrl: string
    type: 'image'
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
