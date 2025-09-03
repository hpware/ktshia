import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  NativeSyntheticEvent,
  TextInputChangeEventData,
  ActivityIndicator,
} from "react-native";
import { useState } from "react";

import { Image } from "expo-image";
export default function HomeScreen() {
  const [url, setUrl] = useState("");
  const [token, setToken] = useState("");
  const verifyAndSaveData = async () => {
    try {
      const req = await fetch(`${server}/api/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
    } catch (e) {}
  };
  return (
    <View className="flex-1 justify-center items-center text-center">
      <Text className="text-2xl font-bold">
        Please enter your URL and token.
      </Text>
      <TextInput
        className="w-80 h-10 border border-gray-300 rounded-md p-2"
        placeholder="URL"
        value={url}
        onChangeText={(text) => setUrl(text)}
      />
      <TextInput
        className="w-80 h-10 border border-gray-300 rounded-md p-2"
        placeholder="Token"
        value={token}
        onChangeText={(text) => setToken(text)}
      />

      <Pressable
        onPress={verifyAndSaveData}
        className="bg-blue-500 text-white p-2 mt-3 rounded-md"
      >
        <Text className="text-white">Submit</Text>
      </Pressable>
    </View>
  );
}
