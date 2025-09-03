import AsyncStorage from "@react-native-async-storage/async-storage";

const storeIntoLocalStorage = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error("Error storing data:", error);
  }
};

const getFromLocalStorage = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value;
  } catch (error) {
    console.error("Error retrieving data:", error);
    return null;
  }
};

const removeFromLocalStorage = async (key: string) => {
  try {
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error("Error removing data:", error);
  }
};

const clearLocalStorage = async () => {
  try {
    await AsyncStorage.clear();
  } catch (error) {
    console.error("Error clearing data:", error);
  }
};

const updateLocalStorage = async (key: string, value: string) => {
  try {
    await AsyncStorage.setItem(key, value);
  } catch (error) {
    console.error("Error updating data:", error);
  }
};

const checkLocalStorage = async (key: string) => {
  try {
    const value = await AsyncStorage.getItem(key);
    return value !== null;
  } catch (error) {
    console.error("Error checking data:", error);
  }
};

export {
  storeIntoLocalStorage,
  getFromLocalStorage,
  removeFromLocalStorage,
  clearLocalStorage,
  updateLocalStorage,
  checkLocalStorage,
};
