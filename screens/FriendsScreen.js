import { StyleSheet, Text, View, TouchableOpacity, Modal, TextInput, Image, Button, FlatList } from "react-native";
import React, { useEffect, useContext, useState } from "react";
import axios from "axios";
import { Ionicons } from "@expo/vector-icons";
import { UserType } from "../UserContext";
import FriendRequest from "../components/FriendRequest";
import MyAlert from "./MyAlert";
import * as ImagePicker from 'expo-image-picker';

const FriendsScreen = () => {
  const { userId } = useContext(UserType);
  const [friendRequests, setFriendRequests] = useState([]);
  const [statuses, setStatuses] = useState([]);
  const [alert, setAlert] = useState({ visible: false, type: "", message: "" });
  const [modalVisible, setModalVisible] = useState(false);
  const [statusText, setStatusText] = useState("");
  const [statusImage, setStatusImage] = useState(null);

  const showAlert = (type, message) => {
    setAlert({ visible: true, type, message });
    setTimeout(() => {
      setAlert({ visible: false, type: "", message: "" });
    }, 3000);
  };

  useEffect(() => {
    fetchFriendRequests();
    fetchUserStatuses();
  }, [userId]);

  const fetchFriendRequests = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/friend-request/${userId}`);
      if (response.status === 200) {
        const friendRequestsData = response.data.map((friendRequest) => ({
          _id: friendRequest._id,
          name: friendRequest.name,
          email: friendRequest.email,
          image: friendRequest.image,
        }));
        setFriendRequests(friendRequestsData);
        showAlert("success", "Loading...");
      }
    } catch (err) {
      console.log("error message", err);
      showAlert("error", "Failed to fetch friend requests");
    }
  };

  const fetchUserStatuses = async () => {
    try {
      const response = await axios.get(`http://localhost:8000/status/${userId}`);
      if (response.status === 200) {
        setStatuses(response.data);
      }
    } catch (err) {
      console.log(err);
      showAlert("error", "Failed to fetch statuses");
    }
  };

  const openImagePicker = async () => {
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.cancelled) {
      setStatusImage(result.uri);
    }
  };

  const postStatus = async () => {
    const formData = new FormData();
    formData.append("userId", userId);
    formData.append("text", statusText);

    if (statusImage) {
      formData.append("imageFile", {
        uri: statusImage,
        type: "image/jpeg",
        name: statusImage.split('/').pop(),
      });
    }

    try {
      const response = await axios.post("http://localhost:8000/post-status", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.status === 200) {
        showAlert("success", "Status posted successfully");
        fetchUserStatuses(); // Refresh statuses after posting
        setStatusText("");
        setStatusImage(null);
      }
    } catch (err) {
      console.log(err);
      showAlert("error", "Failed to post status");
    }
    setModalVisible(false);
  };

  const renderStatus = ({ item }) => (
    <View style={styles.statusContainer}>
      {item.image && (
        <Image source={{ uri: item.image }} style={styles.statusImage} />
      )}
      <Text style={styles.statusText}>{item.text}</Text>
      <Text style={styles.statusTimestamp}>{new Date(item.createdAt).toLocaleString()}</Text>
    </View>
  );

  return (
    <View style={styles.container}>
      <MyAlert type={alert.type} message={alert.message} visible={alert.visible} />
      <View style={styles.header}>
        <Text style={styles.headerText}>Friends Zone</Text>
        <TouchableOpacity onPress={() => setModalVisible(true)}>
          <Ionicons name="add-circle" size={30} color="#007bff" />
        </TouchableOpacity>
      </View>
      {friendRequests.length > 0 && <Text style={styles.subHeaderText}>Your Friend Requests!</Text>}
      {friendRequests.map((item, index) => (
        <FriendRequest
          key={index}
          item={item}
          friendRequests={friendRequests}
          setFriendRequests={setFriendRequests}
        />
      ))}
      {statuses.length > 0 && (
        <FlatList
          data={statuses}
          renderItem={renderStatus}
          keyExtractor={(item) => item._id}
          style={styles.statusList}
        />
      )}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalView}>
          <Text style={styles.modalText}>Post Status</Text>
          <TextInput
            style={styles.input}
            placeholder="What's on your mind?"
            value={statusText}
            onChangeText={setStatusText}
          />
          <TouchableOpacity onPress={openImagePicker} style={styles.imagePickerButton}>
            <Text style={styles.buttonText}>Pick an image</Text>
          </TouchableOpacity>
          {statusImage && (
            <Image source={{ uri: statusImage }} style={styles.statusImage} />
          )}
          <View style={styles.modalButtonContainer}>
            <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.button}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={postStatus} style={styles.button}>
              <Text style={styles.buttonText}>Post</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
};

export default FriendsScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    marginHorizontal: 12,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginVertical: 10,
  },
  headerText: {
    fontSize: 20,
    color: "#007bff",
    fontWeight: "bold",
  },
  subHeaderText: {
    color: "gray",
  },
  statusList: {
    marginTop: 20,
  },
  statusContainer: {
    padding: 10,
    marginBottom: 10,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
    borderColor: "#ddd",
    borderWidth: 1,
  },
  statusText: {
    fontSize: 16,
    color: "#333",
  },
  statusTimestamp: {
    fontSize: 12,
    color: "gray",
    marginTop: 5,
  },
  statusImage: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 10,
  },
  modalView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.5)",
  },
  modalText: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 10,
    color: "#fff",
  },
  input: {
    width: "80%",
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  imagePickerButton: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
  },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "60%",
  },
  button: {
    backgroundColor: "#007bff",
    padding: 10,
    borderRadius: 8,
    marginHorizontal: 5,
  },
});
