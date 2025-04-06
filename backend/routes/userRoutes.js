import express from 'express';
// import {  getUserById, updateUser, deleteUser } from '../models/userModel.js';

import {createUser,
    loginUser,
    logoutCurrentUser,
    getAllUsers,
    getCurrentUserProfile,
    updateCurrentUserProfile,
    deleteUserById,
    getUserById,
    updateUserById } from "../controllers/userController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";


const router = express.Router();

// Create User
router.route("/")
.post(createUser)
.get(authenticate, getAllUsers);
router.route("/auth").post(loginUser);
router.route("/logout").post(authenticate,logoutCurrentUser);

router
  .route("/profile")
  .get(authenticate, getCurrentUserProfile)
  .put(authenticate, updateCurrentUserProfile);

//ADMIN ROUTES
router
  .route("/:id")
  .delete(authenticate,  deleteUserById)
  .get(authenticate,  getUserById)
  .put(authenticate, updateUserById);




// // Get User by ID
// router.get('/:id', async (req, res) => {
//   try {
//     const user = await getUserById(req.params.id);
//     res.status(200).json(user);
//   } catch (error) {
//     res.status(404).json({ error: error.message });
//   }
// });




// // Update User
// router.put('/:id', async (req, res) => {
//   try {
//     const updatedUser = await updateUser(req.params.id, req.body);
//     res.status(200).json(updatedUser);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

// // Delete User
// router.delete('/:id', async (req, res) => {
//   try {
//     const message = await deleteUser(req.params.id);
//     res.status(200).json(message);
//   } catch (error) {
//     res.status(500).json({ error: error.message });
//   }
// });

export default router;
