---
id: firebase-usage
title: Usage
---

As mentioned in [How it works?](firebase-overview#how-it-works), you will need to register a user using [Firebase Authentication](https://firebase.google.com/docs/auth). If you are using Firebase Authentication as your auth provider you don't need to do anything except calling `createUserInFirestore` after registration.

```ts
import { createUserInFirestore } from '@flyerhq/react-native-firebase-chat-core'

await createUserInFirestore({
  firstName: 'John',
  id: credential.user.uid, // UID from Firebase Authentication
  imageUrl: 'https://i.pravatar.cc/300',
  lastName: 'Doe',
})
```

You can provide values like `firstName`, `imageUrl` and `lastName` if you're planning to have a screen with all users available for chat. The `id` is the only required field and you **need to** use the `uid` you get from the Firebase Authentication after you register a user. If you don't use Firebase for authentication, you can register a user using your custom `JWT` token, then call `createUserInFirestore` as described above.

Aside from registration, you will need to log users in when appropriate, using available methods from Firebase Authentication, including the custom `JWT` token.

## Firebase Chat with custom backend

This wasn't verified on production, but if you have your backend and want to use Firebase only for the chat functionality, you can register/login users using custom `JWT` token as described above and save received `uid` to your `users` table. Then you can have a screen with all users from your `users` table where each of them will have an assigned `uid` that will be used to start a chat. Or maybe you will have a search mechanism implemented on your backend, or you don't show users at all, just a button to start a chat with a random person, you still have access to that `uid`.

Alternatively, you can use the `useUsers` hook which will return all registered users with avatars and names. The returned list is dynamic and will change in real-time.

```ts
import { useUsers } from '@flyerhq/react-native-firebase-chat-core'
import { FlatList } from 'react-native'

const UsersScreen = () => {
  const { users } = useUsers()

  return (
    <FlatList
      // ...
      data={users}
    />
  )
}

export default UsersScreen
```

## Starting a chat

When you have access to that `uid` or you have the whole `User` object from the `useUsers` hook, you can call either `createRoom` or `createGroupRoom`. For the group, you will need to additionally provide a name and an optional image.

```ts
import { createRoom } from '@flyerhq/react-native-firebase-chat-core'
import { FlatList } from 'react-native'

const UsersScreen = () => {
  // Create a user with an ID of UID if you don't use `useUsers`
  const handlePress = async (otherUser: User) => {
    const room = await createRoom(otherUser)

    // Navigate to the Chat screen
  }

  return (
    <FlatList
      // ...
      data={users}
    />
  )
}

export default UsersScreen
```

## Rooms

To render user's rooms you use the `useRooms` hook. `Room` object will the have name and image URL taken either from provided ones for the group or set to the other person's image URL and name. See [Security Rules](firebase-rules) for more info about rooms filtering. The returned list is dynamic and will change in real-time.

```ts
import { useRooms } from '@flyerhq/react-native-firebase-chat-core'
import { FlatList } from 'react-native'

const RoomsScreen = () => {
  const { rooms } = useRooms()

  return (
    <FlatList
      // ...
      data={rooms}
    />
  )
}

export default RoomsScreen
```

## Messages

`useMessages` hook will give you access to all messages in the specified room. The returned list is dynamic and will change in real-time.

```ts
import { useMessages } from '@flyerhq/react-native-firebase-chat-core'

const { messages, sendMessage, updateMessage } = useMessages(room)
```

If you use Flyer Chat UI you can just pass `messages` to the `messages` prop of the Chat component. See the [example](https://github.com/flyerhq/react-native-firebase-chat-core/blob/main/example/src/screens/ChatScreen/ChatScreen.tsx).

## `useFirebaseUser`

`useFirebaseUser` is a simple helper you can use to see which user is currently logged in through Firebase Authentication. The returned type comes from the Firebase library and **it is not the same `User` as above**.
