import express from 'express';
import { initializeApp } from 'firebase/app';  // ✅ Correct import
import { getFirestore } from 'firebase/firestore';  // ✅ Correct import
import dotenv from "dotenv";
import cookieParser from "cookie-parser";

//import routes
import userRoutes from "./routes/userRoutes.js"

// PORT and Firebase Config
dotenv.config();
const PORT = process.env.PORT || 5000;

const firebaseConfig = {
    apiKey: "AIzaSyCbzih2Asld1CTsXbi3CBeYPjVg6V3c4wg",
    authDomain: "punchmate-f099a.firebaseapp.com",
    projectId: "punchmate-f099a",
    storageBucket: "punchmate-f099a.appspot.com",
    messagingSenderId: "849887051368",
    appId: "1:849887051368:web:49bc277aca792b718cc5dd"
};

// ✅ Correct way to initialize Firebase
const firebaseApp = initializeApp(firebaseConfig);
const db = getFirestore(firebaseApp);

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.use("/api/users", userRoutes);
// app.use("/api/category", categoryRoutes);


app.get('/', (req, res) => {
    res.send('Hello World!');
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
