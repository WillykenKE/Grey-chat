import {
  KeyboardAvoidingView,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import axios from "axios";
import { Ionicons } from '@expo/vector-icons';
import MaterialIcons from '@expo/vector-icons/MaterialIcons';
import AntDesign from '@expo/vector-icons/AntDesign';
import AsyncStorage from "@react-native-async-storage/async-storage";
import MyAlert from "./MyAlert";

const LoginScreen = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [alert, setAlert] = useState({ visible: false, type: "", message: "" });
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const navigation = useNavigation();

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        const token = await AsyncStorage.getItem("authToken");
        if (token) {
          navigation.replace("Home");
        }
      } catch (error) {
        console.log("error", error);
      }
    };
    checkLoginStatus();
  }, [navigation]);

  const showAlert = (type, message) => {
    setAlert({ visible: true, type, message });
    setTimeout(() => {
      setAlert({ visible: false, type: "", message: "" });
    }, 3000);
  };

  const handleLogin = () => {
    const user = {
      email: email,
      password: password,
    };

    axios
      .post("http://localhost:8000/login", user)
      .then((response) => {
        console.log(response);
        const token = response.data.token;
        AsyncStorage.setItem("authToken", token);
        showAlert("success", "Login Successful");
        navigation.replace("Home");
      })
      .catch((error) => {
        showAlert("error", "Invalid email or password");
        console.log("Login Error", error);
      });
  };

  return (
    <View style={{ flex: 1, backgroundColor: "white", padding: 10, alignItems: "center", justifyContent:"center" }}>
      <MyAlert type={alert.type} message={alert.message} visible={alert.visible} />
      <View>
      <KeyboardAvoidingView>
        <View style={{justifyContent: "center", alignItems: "center" }}>
          <Text style={{ color: "#111", fontSize: 20, fontWeight: "bold" }}>K.CHAT</Text>
          <Text style={{ fontSize: 17, fontWeight: "600", marginTop: 7, color:"gray" }}>Log into Your Account</Text>
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
          <Text style={{color:"#007bff"}}>Forgot password</Text>
          <Pressable
            onPress={handleLogin}
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
            <Text style={{ color: "white", fontSize: 16, fontWeight: "bold", textAlign: "center" }}>
              Login
            </Text>
          </Pressable>
          <Pressable onPress={() => navigation.navigate("Register")} style={{ marginTop: 15 }}>
            <Text style={{ textAlign: "center", color: "gray", fontSize: 16 }}>
              Don't have an account? Sign Up
            </Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
      </View>
    </View>
  );
};

export default LoginScreen;

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
    paddingHorizontal: 4,
  },
  googletextInput: {
    fontSize: 18,
    flex: 1,
    padding: 4,
    paddingVertical:4,
    paddingHorizontal:4
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
    paddingVertical:4,
    paddingHorizontal:4
  },
});
