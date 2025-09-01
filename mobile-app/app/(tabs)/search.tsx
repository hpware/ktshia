import { View, Text, TextInput, Pressable } from 'react-native'

export default function SearchScreen() {
    return (
        <View className="p-4">
            {/**Search bar */}
            <View className="mt-2 w-full flex flex-col">
                <Text className="text-lg font-bold">查詢</Text> 
                <View className="flex flex-row w-full m-2 bg-gray-100 rounded-xl shadow-sm">
                    <TextInput placeholder={"Search"} className="rounded-xl border-0 p-1 flex-1 bg-transparent"/> 
                    <Pressable className="p-2 bg-blue-500 rounded-xl ml-3 mr-2">🔎</Pressable>
                </View>
        </View>
        </View>
    )
}