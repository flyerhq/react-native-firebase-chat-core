import { COLORS, getUserAvatarNameColor } from '@flyerhq/react-native-chat-ui'
import {
  Room,
  useFirebaseUser,
  useRooms,
} from '@flyerhq/react-native-firebase-chat-core'
import auth from '@react-native-firebase/auth'
import { CompositeNavigationProp } from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useLayoutEffect } from 'react'
import {
  Alert,
  Button,
  ColorValue,
  FlatList,
  ImageBackground,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { MainStackParamList, RootStackParamList } from 'src/types'

interface Props {
  navigation: CompositeNavigationProp<
    NativeStackNavigationProp<RootStackParamList, 'Main'>,
    NativeStackNavigationProp<MainStackParamList>
  >
}

const RoomsScreen = ({ navigation }: Props) => {
  const { firebaseUser } = useFirebaseUser()
  const { rooms } = useRooms()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button disabled={!firebaseUser} onPress={logout} title='Logout' />
      ),
      headerRight: () => (
        <Button
          disabled={!firebaseUser}
          onPress={() => navigation.navigate('UsersStack')}
          title='Add'
        />
      ),
    })
  }, [firebaseUser, navigation])

  const logout = async () => {
    try {
      await auth().signOut()
    } catch (e) {
      Alert.alert('Error', (e as Error).message, [{ text: 'OK' }])
    }
  }

  const renderAvatar = (item: Room) => {
    let color: ColorValue | undefined

    if (item.type === 'direct') {
      const otherUser = item.users.find((u) => u.id !== firebaseUser?.uid)

      if (otherUser) {
        color = getUserAvatarNameColor(otherUser, COLORS)
      }
    }

    const name = item.name ?? ''

    return (
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={[
          styles.roomImage,
          { backgroundColor: item.imageUrl ? undefined : color },
        ]}
      >
        {!item.imageUrl ? (
          <Text style={styles.userInitial}>
            {name ? name.charAt(0).toUpperCase() : ''}
          </Text>
        ) : null}
      </ImageBackground>
    )
  }

  const renderItem = ({ item }: { item: Room }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Chat', { room: item })}
    >
      <View style={styles.roomContainer}>
        {renderAvatar(item)}
        <Text>{item.name ?? ''}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <FlatList
      contentContainerStyle={styles.contentContainer}
      data={rooms}
      keyExtractor={(item) => item.id}
      renderItem={renderItem}
      ListEmptyComponent={() => (
        <View style={styles.listEmptyComponent}>
          {firebaseUser ? (
            <Text>No rooms</Text>
          ) : (
            <>
              <Text>Not authenticated</Text>
              <Button
                title='Login'
                onPress={() => navigation.navigate('Auth')}
              />
            </>
          )}
        </View>
      )}
    />
  )
}

const styles = StyleSheet.create({
  contentContainer: {
    flexGrow: 1,
  },
  listEmptyComponent: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
    marginBottom: 200,
  },
  roomContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  roomImage: {
    alignItems: 'center',
    borderRadius: 20,
    height: 40,
    justifyContent: 'center',
    marginRight: 16,
    overflow: 'hidden',
    width: 40,
  },
  userInitial: {
    color: 'white',
  },
})

export default RoomsScreen
