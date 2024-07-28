require('dotenv').config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const passport = require("passport");
const bcrypt = require('bcrypt');
const LocalStrategy = require("passport-local").Strategy;
const multer = require("multer");
const path = require('path'); 

const app = express();
const port = process.env.PORT;
const cors = require("cors");
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true, limit: '100mb' }));
app.use(bodyParser.json({ limit: '100mb' }));
app.use(passport.initialize());
const jwt = require("jsonwebtoken");

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to Mongo Db");
  })
  .catch((err) => {
    console.log("Error connecting to MongoDb", err);
  });

app.listen(port, () => {
  console.log("Server running on port 8000");
});

const User = require("./models/user");
const Message = require("./models/message");
const Status = require('./models/status');

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');  // Directory to store images
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + path.extname(file.originalname));  // Append a timestamp to the filename
  }
});
const upload = multer({ storage: storage });

//endpoint for registration of the user
app.post("/register",async (req, res) => {
  const { name, email, password, image } = req.body;
    try {
      // Hash the password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);
  
      // Create a new User object with the hashed password
      const newUser = new User({ name, email, password: hashedPassword, image });
  
      // Save the user to the database
      await newUser.save();
  
      res.status(200).json({ message: 'User registered successfully' });
    } catch (err) {
      console.log('Error registering user', err);
      res.status(500).json({ message: 'Error registering the user!' });
    }
});

//function to create a token for the user
const createToken = (userId) => {
  // Set the token payload
  const payload = {
    userId: userId,
  };

  // Generate the token with a secret key and expiration time
  const token = jwt.sign(payload, process.env.TOKEN, { expiresIn: "1h" });

  return token;
};

//endpoint for logging in of that particular user
app.post("/login",async (req, res) => {
  const { email, password } = req.body;

  //check if the email and password are provided
  if (!email || !password) {
    return res
      .status(404)
      .json({ message: "Email and the password are required" });
  }

  try {
  //check for that user in the database
  const user = await User.findOne({ email })
    
      if (!user) {
        //user not found
        return res.status(404).json({ message: "User not found" });
      }

      // Compare the password with the hashed password stored in the database
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

      const token = createToken(user._id);
      res.status(200).json({ token, message: 'Login successful' });
    }
    catch(error) {
      console.log("error in finding the user", error);
      res.status(500).json({ message: "Internal server Error!" });
    };
});

//endpoint to access all the users except the user who's is currently logged in!
app.get("/users/:userId", (req, res) => {
  const loggedInUserId = req.params.userId;

  User.find({ _id: { $ne: loggedInUserId } })
    .then((users) => {
      res.status(200).json(users);
    })
    .catch((err) => {
      console.log("Error retrieving users", err);
      res.status(500).json({ message: "Error retrieving users" });
    });
});

//endpoint to send a request to a user
app.post("/friend-request", async (req, res) => {
  const { currentUserId, selectedUserId } = req.body;

  try {
    //update the recepient's friendRequestsArray!
    await User.findByIdAndUpdate(selectedUserId, {
      $push: { freindRequests: currentUserId },
    });

    //update the sender's sentFriendRequests array
    await User.findByIdAndUpdate(currentUserId, {
      $push: { sentFriendRequests: selectedUserId },
    });

    res.sendStatus(200);
  } catch (error) {
    res.sendStatus(500);
  }
});

//endpoint to show all the friend-requests of a particular user
app.get("/friend-request/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    //fetch the user document based on the User id
    const user = await User.findById(userId)
      .populate("freindRequests", "name email image")
      .lean();

    const freindRequests = user.freindRequests;

    res.json(freindRequests);
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//endpoint to accept a friend-request of a particular person
app.post("/friend-request/accept", async (req, res) => {
  try {
    const { senderId, recepientId } = req.body;

    //retrieve the documents of sender and the recipient
    const sender = await User.findById(senderId);
    const recepient = await User.findById(recepientId);

    sender.friends.push(recepientId);
    recepient.friends.push(senderId);

    recepient.freindRequests = recepient.freindRequests.filter(
      (request) => request.toString() !== senderId.toString()
    );

    sender.sentFriendRequests = sender.sentFriendRequests.filter(
      (request) => request.toString() !== recepientId.toString
    );

    await sender.save();
    await recepient.save();

    res.status(200).json({ message: "Friend Request accepted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//endpoint to access all the friends of the logged in user!
app.get("/accepted-friends/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId).populate(
      "friends",
      "name email image"
    );
    const acceptedFriends = user.friends;
    res.json(acceptedFriends);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//endpoint to post Messages and store it in the backend
app.post("/messages", upload.single("imageFile"), async (req, res) => {
  try {
    const { senderId, recepientId, messageType, messageText } = req.body;

    const newMessage = new Message({
      senderId,
      recepientId,
      messageType,
      message: messageText,
      timestamp: new Date(),
      imageUrl: messageType === "image" ? req.file.path : null,
    });

    await newMessage.save();
    res.status(200).json({ message: "Message sent Successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

///endpoint to get the userDetails to design the chat Room header
app.get("/user/:userId", async (req, res) => {
  try {
    const { userId } = req.params;

    //fetch the user data from the user ID
    const recepientId = await User.findById(userId);

    res.json(recepientId);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//endpoint to fetch the messages between two users in the chatRoom
app.get("/messages/:senderId/:recepientId", async (req, res) => {
  try {
    const { senderId, recepientId } = req.params;

    const messages = await Message.find({
      $or: [
        { senderId: senderId, recepientId: recepientId },
        { senderId: recepientId, recepientId: senderId },
      ],
    }).populate("senderId", "_id name");

    res.json(messages);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

//endpoint to delete the messages!
app.post("/deleteMessages", async (req, res) => {
  try {
    const { messages } = req.body;

    if (!Array.isArray(messages) || messages.length === 0) {
      return res.status(400).json({ message: "invalid req body!" });
    }

    await Message.deleteMany({ _id: { $in: messages } });

    res.json({ message: "Message deleted successfully" });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: "Internal Server" });
  }
});



app.get("/friend-requests/sent/:userId",async(req,res) => {
  try{
    const {userId} = req.params;
    const user = await User.findById(userId).populate("sentFriendRequests","name email image").lean();

    const sentFriendRequests = user.sentFriendRequests;

    res.json(sentFriendRequests);
  } catch(error){
    console.log("error",error);
    res.status(500).json({ error: "Internal Server" });
  }
})

app.get("/friends/:userId",(req,res) => {
  try{
    const {userId} = req.params;

    User.findById(userId).populate("friends").then((user) => {
      if(!user){
        return res.status(404).json({message: "User not found"})
      }

      const friendIds = user.friends.map((friend) => friend._id);

      res.status(200).json(friendIds);
    })
  } catch(error){
    console.log("error",error);
    res.status(500).json({message:"internal server error"})
  }
})

//uploading profile
app.post('/user/:userId/update-image', upload.single('image'), async (req, res) => {
  try {
    const { userId } = req.params;
    const imageUrl = `/uploads/${req.file.filename}`; // Adjust the path as needed

    await User.findByIdAndUpdate(userId, { image: imageUrl });
    res.status(200).json({ message: 'Image updated successfully' });
  } catch (error) {
    console.error('Error updating image', error);
    res.status(500).json({ message: 'Internal server error' });
  }
});

// Endpoint to update user profile picture
app.post("/update-profile-picture/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { image } = req.body; // Assuming the image is sent in the body
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.image = image;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to update user profile name
app.post("/update-profile-name/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const { name } = req.body;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    user.name = name;
    await user.save();
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

//user details
app.get("/user-details/:userId", async (req, res) => {
  try {
    const { userId } = req.params;
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to post a status
app.post("/status", upload.fields([{ name: 'imageFiles', maxCount: 5 }, { name: 'videoFiles', maxCount: 2 }]), async (req, res) => {
  try {
    const { userId, text } = req.body;
    const images = req.files['imageFiles'] ? req.files['imageFiles'].map(file => file.path) : [];
    const videos = req.files['videoFiles'] ? req.files['videoFiles'].map(file => file.path) : [];

    const newStatus = new Status({
      userId,
      text,
      images,
      videos,
      timestamp: new Date(),
    });

    await newStatus.save();
    res.status(200).json({ message: "Status posted successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
});

// Endpoint to post a status
app.post("/post-status", upload.single("imageFile"), async (req, res) => {
  try {
    const statusData = {
      userId: req.body.userId,
      text: req.body.text,
      image: req.file ? req.file.path : null, // Store the path of the uploaded file
    };

    const newStatus = new Status(statusData);

    await newStatus.save();
    res.status(200).json({ message: "Status posted successfully" });
  } catch (error) {
    console.error("Error posting status:", error);
    res.status(500).json({ message: "Failed to post status" });
  }
});

// Endpoint to fetch statuses of accepted friends
app.get("/statuses/:userId", async (req, res) => {
  const { userId } = req.params;
  try {
    const user = await User.findById(userId).populate("friends");
    const friendIds = user.friends.map((friend) => friend._id);
    const statuses = await Status.find({ userId: { $in: friendIds } }).populate("userId", "name image");
    res.json(statuses);
  } catch (error) {
    console.error("Error fetching statuses", error);
    res.status(500).json({ message: "Internal server error" });
  }
});
