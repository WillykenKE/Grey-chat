import React, { useContext, useEffect, useState } from "react";
import { View, StyleSheet, Text, TextInput } from "react-native";
import { useNavigation } from "@react-navigation/native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { Ionicons, MaterialIcons, AntDesign } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";
import jwt_decode from "jwt-decode";
import axios from "axios";
import User from "../components/User";
import { UserType } from "../UserContext";
import ChatsScreen from "./ChatsScreen";
import FriendsScreen from "./FriendsScreen";
import SettingsScreen from "./SettingsScreen";

const Tab = createBottomTabNavigator();

const HomeScreen = () => {
  const navigation = useNavigation();
  const { userId, setUserId } = useContext(UserType);
  const [users, setUsers] = useState([]);

  // Logout function
  const logout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace("Login");
    } catch (error) {
      console.log("Logout Error", error);
      // Handle error gracefully
    }
  };

  useEffect(() => {
    const fetchUsers = async () => {
      const token = await AsyncStorage.getItem("authToken");
      const decodedToken = jwt_decode(token);
      const userId = decodedToken.userId;
      setUserId(userId);

      axios
        .get(`http://localhost:8000/users/${userId}`)
        .then((response) => {
          setUsers(response.data);
        })
        .catch((error) => {
          console.log("Error retrieving users", error);
        });
    };

    fetchUsers();
  }, [setUserId]);

  return (
    <View style={{ flex: 1, backgroundColor: "#fff", padding: 10, marginHorizontal: 12 }}>
      <View style={styles.header}>
        <Text style={styles.headerText}>Make friends</Text>
        <Text style={{color:"#d1d1d1", marginVertical:10}}>Add more friends for chat</Text>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={16} color="gray" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search for friends"
            placeholderTextColor="gray"
          />
        </View>
      </View>
      <View style={{ flex: 1, padding: 10 }}>
        {users.map((item, index) => (
          <User key={index} item={item} />
        ))}
      </View>
    </View>
  );
};

const BottomTabNavigator = () => {
  return (
    <Tab.Navigator
      tabBarOptions={{
        showLabel: false,
        style: {
          backgroundColor: "#fff",
          borderTopWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
      }}
    >
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <AntDesign name="adduser" size={size} color={color} />
          ),
          headerShown: false
        }}
      />
      <Tab.Screen
        name="Friends"
        component={FriendsScreen} // Replace with your FriendsScreen component
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people-outline" size={size} color={color} />
          ),
          headerShown: false
        }}
      />
      <Tab.Screen
        name="Chats"
        component={ChatsScreen} // Replace with your ChatsScreen component
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons
              name="chatbox-ellipses-outline"
              size={size}
              color={color}
            />
          ),
          headerShown: false
        }}
      />
      <Tab.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings-outline" size={size} color={color} />
          ),
          headerShown: false
        }}
      />
    </Tab.Navigator>
  );
};

export default BottomTabNavigator;

const styles = StyleSheet.create({
  header: {
    padding: 10,
    backgroundColor: "#f8f8f8",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#007bff",
  },
  searchContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-start",
    width: "100%",
    backgroundColor: "black",
    padding: 4,
    borderRadius: 8,
    marginHorizontal: "auto",
    marginBottom: 10,
  },
  searchIcon: {
    marginLeft: 10,
  },
  searchInput: {
    marginLeft: 10,
    color: "white",
  },
});
