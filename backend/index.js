const express = require('express');
const cors = require('cors');
const app = express();
const dotenv = require("dotenv");
dotenv.config();

// Connect DB
require('./config/db')();

app.use(express.json()); // for JSON body
app.use(express.urlencoded({ extended: true })); // for form-urlencoded

// CORS
app.use(cors({
    origin: ["http://localhost:5173", "https://mirosajewelry.vercel.app", "http://54.152.200.240"],
    credentials: true,
}));

// Routes
app.get('/', (req, res) => res.send('API Running'));
app.use("/api", require('./routes/indexRoute'));

const PORT = process.env.PORT || 8000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
