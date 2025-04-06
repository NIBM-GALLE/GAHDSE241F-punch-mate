import admin from 'firebase-admin';
import fs from 'fs';
import asyncHandler from "../middlewares/asyncHandler.js";  // Fix typo
import bcrypt from "bcryptjs";
import createToken from "../utils/createToken.js";

// Initialize Firebase Admin SDK (only once)
const serviceAccount = JSON.parse(fs.readFileSync('./backend/creds.json', 'utf8'));

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: "https://punchmate-f099a.firebaseio.com",
  });
}

const db = admin.firestore();
const usersCollection = db.collection('users');

// Create a user
const createUser = asyncHandler(async (req, res) => {
  const { username, email, password } = req.body;

  if (!username || !email || !password) {
    return res.status(400).json({ message: "Please fill all the fields." });
  }

  // Check if email already exists
  const checkUniqueEmailQuery = await usersCollection.where("email", "==", email).get();
  if (!checkUniqueEmailQuery.empty) {
    return res.status(400).json({ message: "User already exists" });
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(password, salt);

  // Create user object
  const newUser = { username, email, password: hashedPassword };

  try {
    // Add user to Firestore
    const userRef = await usersCollection.add(newUser);
    // Generate token
    createToken(res, userRef.id);

    // Send response
    res.status(201).json({
      id: userRef.id, // Firestore document ID
      username: newUser.username,
      email: newUser.email,
    });
  } catch (error) {
    res.status(500).json({ message: "Error creating user: " + error.message });
  }
});


// Login a user
const loginUser = asyncHandler(async (req, res) => {
    const { email, password } = req.body;
  
    const existingUserSnapshot = await usersCollection.where("email", "==", email).get();
  
    if (existingUserSnapshot.empty) {
      return res.status(400).json({ message: "User not found" });
    }
  
    const existingUser = existingUserSnapshot.docs[0].data();
  
    
    const isPasswordValid = await bcrypt.compare(password, existingUser.password);
  
    if (isPasswordValid) {
      createToken(res, existingUserSnapshot.docs[0].id); 
  
      res.status(200).json({
        id: existingUserSnapshot.docs[0].id, 
        username: existingUser.username,
        email: existingUser.email,
        // isAdmin: existingUser.isAdmin,

      });
      return; 
    } else {
      return res.status(400).json({ message: "Invalid credentials" });
    }
});

//Lpogout a user
const logoutCurrentUser = asyncHandler(async (req, res) => {
    res.cookie("jwt", "", {
      httpOnly: true,
      expires: new Date(0),
    });
  
    res.status(200).json({ messgage: "Logged out successfully" });
});



const getAllUsers = asyncHandler(async (req, res) => {
    const snapshot = await usersCollection.get();
    const users = snapshot.docs.map(doc => doc.data());
    
    res.json(users);
  });
  
  const getCurrentUserProfile = asyncHandler(async (req, res) => {
    const userRef = usersCollection.doc(req.user.userId); // Assuming userId is passed in the JWT
    const userDoc = await userRef.get();
  
    if (userDoc.exists) {
      const user = userDoc.data();
      res.json({
        _id: userDoc.id, // Firestore document ID
        username: user.username,
        email: user.email,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  });
  
  const updateCurrentUserProfile = asyncHandler(async (req, res) => {
    const userRef = usersCollection.doc(req.user.userId);
    const userDoc = await userRef.get();
  
    if (userDoc.exists) {
      const user = userDoc.data();
      
      // Update fields
      const updatedUser = {
        username: req.body.username || user.username,
        email: req.body.email || user.email,
      };
  
      if (req.body.password) {
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(req.body.password, salt);
        updatedUser.password = hashedPassword; // Assuming password is stored in Firestore
      }
  
      await userRef.update(updatedUser);
  
      res.json({
        _id: userDoc.id, // Firestore document ID
        username: updatedUser.username,
        email: updatedUser.email,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  });
  
  const deleteUserById = asyncHandler(async (req, res) => {
    const userRef = usersCollection.doc(req.params.id);
    const userDoc = await userRef.get();
  
    if (userDoc.exists) {
      const user = userDoc.data();
      
      if (user.isAdmin) {
        res.status(400);
        throw new Error("Cannot delete Admin account");
      }
      
      await userRef.delete();
      res.status(200).json({ message: "User removed" });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  });
  
  const getUserById = asyncHandler(async (req, res) => {
    const userRef = usersCollection.doc(req.params.id);
    const userDoc = await userRef.get();
  
    if (userDoc.exists) {
      const user = userDoc.data();
      res.json(user); 
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  });
  
  const updateUserById = asyncHandler(async (req, res) => {
    const userRef = usersCollection.doc(req.params.id);
    const userDoc = await userRef.get();
  
    if (userDoc.exists) {
      const user = userDoc.data();
      
      // Update user fields
      const updatedUser = {
        username: req.body.username || user.username,
        email: req.body.email || user.email,
        // isAdmin: Boolean(req.body.isAdmin), 
      };
  
      await userRef.update(updatedUser);
  
      res.json({
        _id: userDoc.id, // Firestore document ID
        username: updatedUser.username,
        email: updatedUser.email,
        // isAdmin: updatedUser.isAdmin,
      });
    } else {
      res.status(404);
      throw new Error("User not found");
    }
  });
  


export { 
    createUser,
    loginUser,
    logoutCurrentUser,
    getAllUsers,
    getCurrentUserProfile,
    updateCurrentUserProfile,
    deleteUserById,
    getUserById,
    updateUserById 
};
