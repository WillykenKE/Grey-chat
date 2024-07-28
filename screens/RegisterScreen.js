import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  KeyboardAvoidingView,
  Pressable,
  Alert,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import { launchImageLibrary } from "react-native-image-picker";
import MyAlert from "./MyAlert";

const RegisterScreen = () => {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [imageUri, setImageUri] = useState("");
  const [alert, setAlert] = useState({ visible: false, type: "", message: "" });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigation = useNavigation();

  const showAlert = (type, message) => {
    setAlert({ visible: true, type, message });
    setTimeout(() => {
      setAlert({ visible: false, type: "", message: "" });
    }, 3000);
  };

  const handleRegister = () => {
    const user = {
      name: name,
      email: email,
      password: password,
      image: imageUri,
    };

    axios
      .post("http://localhost:8000/register", user)
      .then((response) => {
        console.log(response);
        showAlert("success", "Congratulations, now login.");
        setName("");
        setEmail("");
        setPassword("");
        setImageUri("");
      })
      .catch((error) => {
        showAlert("error", "An error occurred, please retry!");
      });
  };

  const selectImage = () => {
    launchImageLibrary({ mediaType: "photo" }, (response) => {
      if (response.didCancel) {
        console.log("User cancelled image picker");
      } else if (response.error) {
        console.log("ImagePicker Error: ", response.error);
      } else if (response.assets) {
        const selectedImage = response.assets[0].uri;
        setImageUri(selectedImage);
      }
    });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white", padding: 10, alignItems: "center", justifyContent:"center" }}>
      <MyAlert type={alert.type} message={alert.message} visible={alert.visible} />
      <View>
      <KeyboardAvoidingView>
        <View
          style={{
            marginTop: 50,
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <Text style={{ color: "#111", fontSize: 20, fontWeight: "bold" }}>
            K.CHAT
          </Text>
          <Text style={{ fontSize: 17, fontWeight: "600", marginTop: 7, color:"gray" }}>
            Sign up new account
          </Text>
        </View>

        <View style={{ marginTop: 10 }}>
        <View style={styles.googleContainer}>
      <TextInput
        style={styles.googletextInput}
        placeholder="Google account"
        placeholderTextColor="gray"
      />
      <AntDesign style={styles.googleicon} name="google" size={24} color="black" />
      </View>
          <Text style={{textAlign:"center",marginTop:10, color:"#d1d1d1"}}>Don't link, go manual</Text>
          <View style={{ marginTop: 2 }}>
          <View style={styles.inputContainer}>
          <MaterialIcons name="person" size={18} color="#d1d1d1" style={styles.inputicon}/>
            <TextInput
            value={name}
            onChangeText={(text) => setName(text)}
              style={styles.inputtextInput}
              placeholder="enter name"
              placeholderTextColor="gray"
            />
          </View>
          </View>
          <View style={{ marginTop: 2 }}>
          <View style={styles.inputContainer}>
          <MaterialIcons name="email" size={18} color="#d1d1d1" style={styles.inputicon}/>
            <TextInput
            value={email}
            onChangeText={(text) => setEmail(text)}
              style={styles.inputtextInput}
              placeholder="enter email"
              placeholderTextColor="gray"
            />
          </View>
          </View>
          <View style={{ marginTop: 2 }}>
          <View style={styles.inputContainer}>
          <Ionicons name="key-sharp" size={18} color="#d1d1d1" style={styles.inputicon}/>
          <TextInput
            value={password}
            onChangeText={(text) => setPassword(text)}
              style={styles.inputtextInput}
              placeholder="Enter password"
              placeholderTextColor="gray"
              secureTextEntry={!isPasswordVisible}
            />
             <Ionicons name={isPasswordVisible ? 'eye-off' : 'eye'} size={18} color="#d1d1d1" style={styles.inputicon2} onPress={() => setIsPasswordVisible(!isPasswordVisible)}/>
            </View>
          </View>

          <View style={{ marginTop: 10, alignItems:"center" }}>
            <View style={{display:"flex",alignItems:"center",justifyContent:"space-evenly",flexDirection:"row", width:"100%"}}>              
            
            <Text style={{ color: "gray" }}>
                {imageUri ? "Change Profile" : "Select Profile"}
            </Text>
            {imageUri ? (
              <Ionicons name="repeat" size={24} color="black" onPress={selectImage} style={styles.icon} />
            ) : (
              <AntDesign name="adduser" size={24} color="black" onPress={selectImage} style={styles.icon} />
            )}
            </View>
            {imageUri ? (
              <Image
                source={{ uri: imageUri }}
                style={{ width: 100, height: 100, marginTop: 10, borderRadius:"50%" }}
              />
            ) : null}
          </View>

          <Pressable
            onPress={handleRegister}
            style={{
              width: 300,
              backgroundColor: "#111",
              padding: 8,
              marginTop: 30,
              marginLeft: "auto",
              marginRight: "auto",
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                color: "white",
                fontSize: 16,
                fontWeight: "bold",
                textAlign: "center",
              }}
            >
              Sign in
            </Text>
          </Pressable>

          <Pressable
            onPress={() => navigation.goBack()}
            style={{ marginTop: 15 }}
          >
            <Text
              style={{
                textAlign: "center",
                color: "gray",
                fontSize: 16,
                marginBottom: 30,
              }}
            >
              Already have an account? <span style={{color:"#007bff"}}>Log in</span>
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      </View>
    </View>
     
  );
};

export default RegisterScreen;

const styles = StyleSheet.create({
  googleContainer: {
    position: 'relative',
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#d1d1d1',
    borderWidth: 1,
    marginVertical: 10,
    width: 300,
    borderRadius: 8,    
  },
  googletextInput: {
    fontSize: 18,
    flex: 1,
    padding: 4,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
  googleicon: {
    position: 'absolute',
    right: 10,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#d1d1d1',
    borderWidth: 1,
    marginVertical: 10,
    width: 300,
    borderRadius: 8,
    paddingHorizontal: 4,
  },
  inputicon: {
    marginRight: 8,
  },
  inputicon2 : {
    marginRight: 8,
    marginLeft: 8,
  },
  inputtextInput: {
    fontSize: 18,
    flex: 1,
    paddingHorizontal: 4,
    paddingVertical: 4,
  },
});
