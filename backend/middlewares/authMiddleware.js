import jwt from "jsonwebtoken";
import asyncHandler from "../middlewares/asyncHandler.js";
import admin from 'firebase-admin';

// Assuming you have already initialized Firebase Admin
const db = admin.firestore();

const authenticate = asyncHandler(async (req, res, next) => {
  let token;
  // Read the JWT from the 'jwt' cookie
  token = req.cookies.jwt;
  
  if (token) {
    try {
      // Verify the token and extract the userId
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Get the user from Firestore by userId (document ID)
      const userRef = db.collection('users').doc(decoded.userId);
      const userDoc = await userRef.get();

      // Check if the user exists
      if (!userDoc.exists) {
        res.status(404).json({ message: "User not found" });
        return;
      }

      // Attach the user data to the request object
      req.user = userDoc.data();
      
      next();
    } catch (error) {
      res.status(401).json({ message: "Not authorized, token failed" });
    }
  } else {
    res.status(401).json({ message: "Not authorized, no token" });
  }
});

const authorizeAdmin = (req, res, next) => {
  if (req.user && req.user.isAdmin) {
    next(); // Proceed to the next middleware or route
  } else {
    res.status(403).json({ message: "Not authorized as an admin." }); // Forbidden
  }
};

export { authenticate, authorizeAdmin };
