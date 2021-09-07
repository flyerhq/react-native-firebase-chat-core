import {
  COLORS,
  getUserAvatarNameColor,
  getUserName,
} from '@flyerhq/react-native-chat-ui'
import {
  User,
  useRooms,
  useUsers,
} from '@flyerhq/react-native-firebase-chat-core'
import {
  CommonActions,
  CompositeNavigationProp,
} from '@react-navigation/native'
import { NativeStackNavigationProp } from '@react-navigation/native-stack'
import React, { useLayoutEffect } from 'react'
import {
  Button,
  FlatList,
  ImageBackground,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { RootStackParamList, UsersStackParamList } from 'src/types'

interface Props {
  navigation: CompositeNavigationProp<
    NativeStackNavigationProp<RootStackParamList, 'UsersStack'>,
    NativeStackNavigationProp<UsersStackParamList>
  >
}

const UsersScreen = ({ navigation }: Props) => {
  const { createRoom } = useRooms()
  const { users } = useUsers()

  useLayoutEffect(() => {
    Platform.OS === 'ios' &&
      navigation.setOptions({
        headerLeft: () => <Button onPress={navigation.goBack} title='Cancel' />,
      })
  })

  const handlePress = async (otherUser: User) => {
    const room = await createRoom(otherUser)

    if (room) {
      navigation.dispatch(
        CommonActions.navigate({
          name: 'Chat',
          params: { room },
        })
      )
    }
  }

  const renderAvatar = (item: User) => {
    const color = getUserAvatarNameColor(item, COLORS)
    const name = getUserName(item)

    return (
      <ImageBackground
        source={{ uri: item.imageUrl }}
        style={[
          styles.userImage,
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

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity onPress={() => handlePress(item)}>
      <View style={styles.userContainer}>
        {renderAvatar(item)}
        <Text>{getUserName(item)}</Text>
      </View>
    </TouchableOpacity>
  )

  return (
    <FlatList
      contentContainerStyle={styles.contentContainer}
      data={users}
      keyExtractor={(item) => item.id}
      ListEmptyComponent={() => (
        <View style={styles.listEmptyComponent}>
          <Text>No users</Text>
        </View>
      )}
      renderItem={renderItem}
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
  userContainer: {
    alignItems: 'center',
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  userImage: {
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

export default UsersScreen
