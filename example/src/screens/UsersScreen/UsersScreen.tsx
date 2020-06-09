import {
  User,
  useRooms,
  useUsers,
} from '@flyerhq/react-native-firebase-chat-core'
import {
  CommonActions,
  CompositeNavigationProp,
} from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useLayoutEffect } from 'react'
import {
  Button,
  FlatList,
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { RootStackParamList, UsersStackParamList } from 'src/types'

interface Props {
  navigation: CompositeNavigationProp<
    StackNavigationProp<RootStackParamList, 'UsersStack'>,
    StackNavigationProp<UsersStackParamList>
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

  const renderItem = ({ item }: { item: User }) => (
    <TouchableOpacity onPress={() => handleOnPress(item)}>
      <View style={styles.userContainer}>
        <Image source={{ uri: item.avatarUrl }} style={styles.userImage} />
        <Text>
          {item.firstName} {item.lastName}
        </Text>
      </View>
    </TouchableOpacity>
  )

  const handleOnPress = async (otherUser: User) => {
    const room = await createRoom({ otherUser })

    navigation.dispatch(
      CommonActions.navigate({
        name: 'Chat',
        params: { roomId: room.id },
      })
    )
  }

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
    borderRadius: 20,
    height: 40,
    marginRight: 16,
    width: 40,
  },
})

export default UsersScreen
