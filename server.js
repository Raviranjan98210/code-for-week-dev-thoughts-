const express = require("express");
const connectDB = require("./config/db");
const app = express();

// Connecting database
connectDB();

app.get("/", (req, res) => {
  res.status(200).send("Api running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server started on ${PORT}`);
});
