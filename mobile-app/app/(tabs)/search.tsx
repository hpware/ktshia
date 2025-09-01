import {
  View,
  Text,
  TextInput,
  Pressable,
  ScrollView,
  NativeSyntheticEvent,
  TextInputChangeEventData,
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
  const onSearchBoxChange = (
    e: NativeSyntheticEvent<TextInputChangeEventData>,
  ) => {
    setSearchBox(e.nativeEvent.text);
  };
  return (
    <View className="p-4">
      {/**Search bar */}
      <View className="mt-2 w-full flex flex-col">
        <Text className="text-lg font-bold">查詢</Text>
        <View className="flex flex-row w-full m-2">
          <TextInput
            placeholder={"Search"}
            className="rounded-xl border p-2 flex-1 bg-transparent"
            onChange={onSearchBoxChange}
            value={searchBox}
          />
        </View>
      </View>
      <Text>{searchBox}</Text>
      <ScrollView>
        <SearchContentItemBlock item={testJsonObject} />
      </ScrollView>
    </View>
  );
}

function SearchContentItemBlock({ item }: { item: searchContentItem }) {
  return (
    <View>
      <Text>{item.busName}</Text>
      <Text>
        {item.fromStop} -{">"} {item.toStop}
      </Text>
    </View>
  );
}
