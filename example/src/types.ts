export type AuthStackParamList = {
  Login: undefined
  Register: undefined
}

export type MainStackParamList = {
  Chat: { roomId: string }
  Rooms: undefined
}

export type RootStackParamList = {
  Auth: undefined
  Main: undefined
  UsersStack: undefined
}

export type UsersStackParamList = {
  Users: undefined
}
