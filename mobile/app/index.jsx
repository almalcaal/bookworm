import { Link } from "expo-router";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuthStore } from "../store/authStore";
import { useEffect } from "react";

export default function Index() {
  const { user, token, checkAuth, logout } = useAuthStore();

  console.log(user, token);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Hello {user?.username}</Text>
      <Text style={styles.title}>Token {token}</Text>
      <TouchableOpacity onPress={logout}>
        <Text>Logout</Text>
      </TouchableOpacity>
      <Link href="/(auth)/signup">Sign up</Link>
      <Link href="/(auth)">Login</Link>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    color: "red",
  },
});
