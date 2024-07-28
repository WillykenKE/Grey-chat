import { StyleSheet, Text, View, ScrollView, Pressable, TextInput } from "react-native";
import React, { useContext, useEffect, useState } from "react";
import { UserType } from "../UserContext";
import { useNavigation } from "@react-navigation/native";
import UserChat from "../components/UserChat";
import MyAlert from "./MyAlert";
import { Ionicons, MaterialIcons, AntDesign } from "@expo/vector-icons";

const ChatsScreen = () => {
  const [acceptedFriends, setAcceptedFriends] = useState([]);
  const [alert, setAlert] = useState({ visible: false, type: "", message: "" });
  const [search, setSearch] = useState("")
  const { userId, setUserId } = useContext(UserType);
  const navigation = useNavigation();

  const showAlert = (type, message) => {
    setAlert({ visible: true, type, message });
    setTimeout(() => {
      setAlert({ visible: false, type: "", message: "" });
    }, 3000);
  };

  useEffect(() => {
    const acceptedFriendsList = async () => {
      try {
        const response = await fetch(
          `http://localhost:8000/accepted-friends/${userId}`
        );
        const data = await response.json();

        if (response.ok) {
          setAcceptedFriends(data);
        } else {
          showAlert("error", "Failed to load friends list");
        }
      } catch (error) {
        console.log("error showing the accepted friends", error);
        showAlert("error", "An error occurred while loading friends list");
      }
    };

    acceptedFriendsList();
  }, [userId]);

  console.log("friends", acceptedFriends);

  return (
    <View style={{ flex: 1 , backgroundColor:"#fff"}}>
      <MyAlert type={alert.type} message={alert.message} visible={alert.visible} />
      <ScrollView showsVerticalScrollIndicator={false} style={{paddingHorizontal:10}}>
      <View style={{marginTop:20, paddingHorizontal:10}}>
        <Text style={{fontSize:20, color:"#007bff", marginBottom:10, fontWeight:"bold"}}>Chats</Text>
        <Text style={{fontSize:15, color:"#d1d1d1", marginBottom:10}}>Connect with the world</Text>
        <View style={{flexDirection:"row", alignItems:"center", justifyContent:"start", width:"100%", backgroundColor:"black", padding:4, borderRadius:8,marginHorizontal:"auto",marginBottom:10}}>          
        <Ionicons name="search" size={16} color="gray" style={{marginLeft:10}} />
        <TextInput
        style={{marginLeft:10}}
        placeholder="Search"
        placeholderTextColor="gray" />          
        </View>
        </View>
        <Pressable>
          {acceptedFriends.map((item, index) => (
            <UserChat key={index} item={item} />
          ))}
        </Pressable>
      </ScrollView>
    </View>
  );
};

export default ChatsScreen;

const styles = StyleSheet.create({
});
