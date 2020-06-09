import { Room, useRooms } from '@flyerhq/react-native-firebase-chat-core'
import auth from '@react-native-firebase/auth'
import { CompositeNavigationProp } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'
import React, { useLayoutEffect } from 'react'
import {
  Alert,
  Button,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native'
import { MainStackParamList, RootStackParamList } from 'src/types'

interface Props {
  navigation: CompositeNavigationProp<
    StackNavigationProp<RootStackParamList, 'Main'>,
    StackNavigationProp<MainStackParamList>
  >
}

const RoomsScreen = ({ navigation }: Props) => {
  const { rooms, user } = useRooms()

  useLayoutEffect(() => {
    navigation.setOptions({
      headerLeft: () => (
        <Button disabled={!user} onPress={logout} title='Logout' />
      ),
      headerRight: () => (
        <Button
          disabled={!user}
          onPress={() => navigation.navigate('UsersStack')}
          title='Add'
        />
      ),
    })
  }, [navigation, user])

  const logout = async () => {
    try {
      await auth().signOut()
    } catch (e) {
      Alert.alert('Error', e.message, [{ text: 'OK' }])
    }
  }

  const renderItem = ({ item }: { item: Room }) => (
    <TouchableOpacity
      onPress={() => navigation.navigate('Chat', { roomId: item.id })}
    >
      <View style={styles.roomContainer}>
        <Image source={{ uri: item.imageUrl }} style={styles.roomImage} />
        <Text>{item.name}</Text>
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
          {user ? (
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
    borderRadius: 20,
    height: 40,
    marginRight: 16,
    width: 40,
  },
})

export default RoomsScreen
