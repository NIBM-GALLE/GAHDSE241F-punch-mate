import admin from 'firebase-admin';
import fs from 'fs';


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

export const createUser = async (userData) => {
  try {
    const userRef = await usersCollection.add(userData);
    return { id: userRef.id, ...userData };
  } catch (error) {
    throw new Error("Error creating user: " + error.message);
  }
};

export const getUserById = async (userId) => {
  try {
    const userDoc = await usersCollection.doc(userId).get();
    if (!userDoc.exists) {
      throw new Error('User not found');
    }
    return { id: userDoc.id, ...userDoc.data() };
  } catch (error) {
    throw new Error("Error fetching user: " + error.message);
  }
};

export const updateUser = async (userId, updateData) => {
  try {
    await usersCollection.doc(userId).update(updateData);
    return { id: userId, ...updateData };
  } catch (error) {
    throw new Error("Error updating user: " + error.message);
  }
};

export const deleteUser = async (userId) => {
  try {
    await usersCollection.doc(userId).delete();
    return { message: "User deleted successfully" };
  } catch (error) {
    throw new Error("Error deleting user: " + error.message);
  }
};
