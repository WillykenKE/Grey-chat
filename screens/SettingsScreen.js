import React, { useEffect, useState, useContext } from 'react';
import { StyleSheet, Text, View, Image, Alert, TextInput, TouchableOpacity } from 'react-native';
import { KeyboardAvoidingView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons, MaterialIcons, AntDesign } from "@expo/vector-icons";
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { UserType } from '../UserContext';
import MyAlert from './MyAlert';

const SettingsScreen = () => {
  const navigation = useNavigation();
  const { userId } = useContext(UserType);
  const [userDetails, setUserDetails] = useState({ name: '', image: '' });
  const [name, setName] = useState('');
  const [alert, setAlert] = useState({ visible: false, type: "", message: "" });

  const showAlert = (type, message) => {
    setAlert({ visible: true, type, message });
    setTimeout(() => {
      setAlert({ visible: false, type: "", message: "" });
    }, 3000);
  };

  const fetchUserDetails = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/user-details/${userId}`);
      setUserDetails(response.data);
      setName(response.data.name);
    } catch (error) {
      showAlert("error", "Error fetching user details", error);
    }
  };

  useEffect(() => {
    fetchUserDetails();
  }, []);

  const logout = async () => {
    try {
      await AsyncStorage.clear();
      navigation.replace("Login");
    } catch (error) {
      showAlert("error", "Failed to log out. Please try again.");
    }
  };

  const changeProfilePicture = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      const imageUri = result.uri;
      setUserDetails((prevDetails) => ({ ...prevDetails, image: imageUri }));
      
      // Send updated image to the backend
      try {
        await axios.post(`http://localhost:8000/update-profile-picture/${userId}`, { image: imageUri });
        showAlert("success", "Profile picture updated successfully.");
      } catch (error) {
        console.error("Error updating profile picture", error);
        showAlert("error", "Failed to update profile picture. Please try again.");
      }
    }
  };

  const updateProfileName = async () => {
    try {
      await axios.post(`http://localhost:8000/update-profile-name/${userId}`, { name });
      setUserDetails((prevDetails) => ({ ...prevDetails, name }));
      showAlert("success", "Profile name updated successfully.");
    } catch (error) {
      console.error("Error updating profile name", error);
      showAlert("error", "Failed to update profile name. Please try again.");
    }
  };

  return (
    <View style={styles.container}>
            <MyAlert type={alert.type} message={alert.message} visible={alert.visible} />
      <KeyboardAvoidingView style={styles.keyboardAvoidingView}>
        <View style={styles.header}>
          <Text style={styles.headerText}>Settings</Text>
        </View>
        
        <View style={styles.userInfo}>
          <Image source={{ uri: userDetails.image }} style={styles.profileImage} />
          <Text style={styles.userName}>{userDetails.name}</Text>
        </View>

        <TouchableOpacity style={styles.button} onPress={changeProfilePicture}>
          <Text style={styles.buttonText}>Change Profile Picture</Text>
        </TouchableOpacity>
        
        {/* Edit name button*/}
        <View style={styles.inputContainer}>
          <Text style={{fontSize:16, color:"#e5e5e5", marginRight:4}}>currently :</Text>
            <TextInput
            value={name}
            onChangeText={setName}
            style={styles.inputtextInput}
            placeholder="Edit profile name"
            placeholderTextColor="black"
            />
           <AntDesign name="checkcircleo" size={18} color="#007bff" style={styles.inputicon} onPress={updateProfileName}/>
          </View>
          <View style={styles.spacers}>
            <View style={styles.spacersBox}>
            <AntDesign name="book" size={18} color="gray" style={styles.spacersIcon} onPress={updateProfileName}/>
           <View style={styles.spacersContainer}>
           <Text style={styles.spacersHeader}>44</Text>
           <Text style={styles.spacersText}>Blocks</Text>
           </View>
            </View>
            <View style={styles.spacersBox}>
            <AntDesign name="calendar" size={18} color="gray" style={styles.spacersIcon} onPress={updateProfileName}/>
           <View style={styles.spacersContainer}>
           <Text style={styles.spacersHeader}>21 Views</Text>
           <Text style={styles.spacersText}>views by date</Text>
           </View>
            </View>
            <View style={styles.spacersBox}>
            <AntDesign name="hourglass" size={18} color="gray" style={styles.spacersIcon} onPress={updateProfileName}/>
           <View style={styles.spacersContainer}>
           <Text style={styles.spacersHeader}>16hrs</Text>
           <Text style={styles.spacersText}>Total time</Text>
           </View>
            </View>
          </View>
          {/* privacy button */}
          <TouchableOpacity style={styles.button} onPress={changeProfilePicture}>
          <Text style={styles.buttonText}>Privacy control</Text>
        </TouchableOpacity>

        <View style={styles.logoutContainer}>
          <TouchableOpacity style={styles.logoutButton} onPress={logout}>
            <Text style={styles.logoutText}>Log out</Text>
            <MaterialIcons name="logout" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </View>
  );
};

export default SettingsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: "#f5f5f5",
  },
  keyboardAvoidingView: {
    paddingHorizontal: 10,
  },
  header: {
    marginTop: 20,
  },
  headerText: {
    fontSize: 20,
    color: "#007bff",
    fontWeight: "bold",
  },
  userInfo: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    marginBottom: 10,
  },
  userName: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  input: {
    backgroundColor: '#f0f0f0',
    padding: 10,
    borderRadius: 8,
    marginVertical: 10,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#007bff",
    padding: 8,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
  },
  logoutContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 20,
  },
  logoutButton: {
    flexDirection: "row",
    justifyContent: "space-evenly",
    alignItems: "center",
    width: "50%",
    backgroundColor: "black",
    padding: 4,
    borderRadius: 8,
  },
  logoutText: {
    color: "#fff",
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#fff',
    marginVertical: 10,
    borderRadius: 8,
    paddingHorizontal: 4,
    backgroundColor: '#fff',
  },
  inputicon: {
    marginRight: 8,
    marginLeft: 8,
  },
  spacersIcon: {
    marginRight: 8,
  },
  inputtextInput: {
    backgroundColor: '#fff',
    fontSize: 16,
    flex: 1,
    paddingVertical:5,
    paddingHorizontal:5
  },
  spacers : {
    flexDirection:"row",
    justifyContent:"space-around",
    marginVertical:10,
  },
  spacersBox : {
    width:90,
    backgroundColor:"white",
    flexDirection:"column",
    justifyContent:"space-between",
    gap:20,
    alignItems:"start",
    borderRadius: 10,
    padding:8
  },
  spacersContainer : {
    flexDirection:"column",
    justifyContent:"space-between",
  },
  spacersHeader : {
    fontSize:13,
    color:"orange"
  },
  spacersText : {
    fontSize:10,
    color:"#007bff"
  }
});
