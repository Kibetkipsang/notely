import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';   
import { login, register } from './controllers/auth'; 

dotenv.config()
const app = express();
app.use(express.json)

app.use(
  cors({
    origin: function (origin, callback) {
      const allowedOrigins = [
        "http://localhost:5173",
        "http://127.0.0.1:5173",
        "http://localhost:3000",
      ];
      if (!origin || allowedOrigins.indexOf(origin) !== -1) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
      "Accept",
      "Cookie",
      "Set-Cookie",
    ],
    exposedHeaders: ["Set-Cookie", "Cookie"],
  }),
);


try{

  // auth routes
  app.post("/auth/register", register)
  app.post("/auth/login", login)

}catch(err){
  console.log(err, "Something went wrong.")
}

const port = 5000;
app.listen(port, () => {
    console.log(`Server running at port ${port}`)
})