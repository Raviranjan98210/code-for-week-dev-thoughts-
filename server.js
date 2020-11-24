const express = require("express");
const connectDB = require("./config/db");
const { json } = require("express");
const app = express();

// Connecting database
connectDB();

// initilizing request body parser

app.use(express.json({ exetended: false }));
// Defining api routes

app.use("/api/auth", require("./routes/api/auth"));
app.use("/api/users", require("./routes/api/users"));
app.use("/api/profile", require("./routes/api/profile"));
app.use("/api/post", require("./routes/api/post"));

app.get("/", (req, res) => {
  res.status(200).send("Api running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`server started on ${PORT}`);
});
