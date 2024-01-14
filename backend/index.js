const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const authRoute = require('./routes/authRoutes');
const path = require('path'); // Import the path module

dotenv.config();
app.use(express.json());
app.use(cors());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(
    process.env.MONGO_URL, {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.log(err));

app.use('/api/auth', authRoute);

// Serve static files from the "build" folder
app.use(express.static(path.join(__dirname, 'build')));

// Define a route for all other requests to serve your React app
app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'build', 'index.html'));
});

app.listen(process.env.PORT || 5000, () => {
    console.log(`Server started on Port ${process.env.PORT}`);
});
