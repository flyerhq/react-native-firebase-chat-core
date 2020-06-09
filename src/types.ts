export interface Message {
  authorId: string
  id: string
  text: string
  timestamp: number
}

export interface Room {
  id: string
  imageUrl?: string
  name?: string
  users: User[]
}

export interface User {
  avatarUrl?: string
  firstName: string
  id: string
  lastName: string
}
