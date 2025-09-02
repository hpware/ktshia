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

interface searchContentItem {
  busName: string;
  busNameEn: string;
  fromStop: string;
  toStop: string;
  city: string;
}

export default function SearchScreen() {
  // testing use only
  const testJsonObject = {
    busName: "33",
    busNameEn: "33",
    fromStop: "Taipei 101",
    toStop: "Demo",
    city: "Taipei City",
  };
  const [searchBox, setSearchBox] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const onSearchBoxChange = (
    e: NativeSyntheticEvent<TextInputChangeEventData>,
  ) => {
    setIsLoading(true);
    console.log(e.nativeEvent.text);
    setSearchBox(e.nativeEvent.text);
  };
  return (
    <View className="p-4">
      {/**Search bar */}
      <View className="mt-2 w-full flex flex-col">
        <Text className="text-4xl font-bold m-4">查詢</Text>
        <View className="flex flex-row w-[90%] m-auto">
          <TextInput
            placeholder={"Search"}
            className="rounded-xl border p-2 flex-1 bg-transparent"
            onChange={onSearchBoxChange}
            value={searchBox}
          />
        </View>
      </View>
      {isLoading ? (
        <ActivityIndicator size="large" className="self-center m-2 p-2" />
      ) : (
        <ScrollView className="pt-2 mt-2">
          <SearchContentItemBlock item={testJsonObject} />
          <SearchContentItemBlock item={testJsonObject} />
          <SearchContentItemBlock item={testJsonObject} />
        </ScrollView>
      )}
    </View>
  );
}

function SearchContentItemBlock({ item }: { item: searchContentItem }) {
  return (
    <View className="flex flex-col p-2 border m-2 rounded">
      <Text>{item.busName}</Text>
      <Text>
        {item.fromStop} -{">"} {item.toStop}
      </Text>
    </View>
  );
}
