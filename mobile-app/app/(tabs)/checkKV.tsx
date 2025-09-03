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
    async function verifyIfSystemConnects() {
      const req = await fetch(`${serverUrl}/api/verify`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      const res = await req.json();
      console.log(res);
      setResponse(JSON.stringify(res.message));
    }
    verifyIfSystemConnects();
  }, []);

  return (
    <View>
      <Text>Server URL: {serverUrl}</Text>
      <Text>Token: {token}</Text>
      <Text>Response: {response}</Text>
    </View>
  );
}
