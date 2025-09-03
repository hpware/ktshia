import * as kv from "@/components/hooks/storeintoLocalStorage";
import { useEffect, useState } from "react";
import { View, Text } from "react-native";

export default function checkLocalStorage() {
  const serverUrl = kv.getFromLocalStorage("server_url");
  const token = kv.getFromLocalStorage("token");
  const [response, setResponse] = useState("");

  if (!serverUrl || !token) {
    throw new Error("Server URL or token not found in local storage");
  }
  useEffect(() => {
    const getData = async () => {
      const req = await fetch(`${serverUrl.value}/api/verify`, {
        headers: {
          Authorization: `Bearer ${token.value}`,
        },
      });
      const res = await req.json();
      console.log(res);
      setResponse(JSON.stringify(res.message));
    };
    getData();
  }, []);
  return (
    <View>
      <Text>Server URL: {serverUrl}</Text>
      <Text>Token: {token}</Text>
      <Text>Response: {response}</Text>
    </View>
  );
}
