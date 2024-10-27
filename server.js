const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const bcrypt = require('bcryptjs');
const path = require('path');

// Initialize the app
const app = express();

// Use body-parser to parse URL-encoded form data
app.use(bodyParser.urlencoded({ extended: true }));

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/valorantGuide', {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => console.log('MongoDB connected'))
  .catch(err => console.log('MongoDB connection error: ', err));

// Create a schema for users
const userSchema = new mongoose.Schema({
    name: String,
    mobile: String,
    password: String
});

// Create a model for the User
const User = mongoose.model('User', userSchema);

// Serve static files (e.g., index.html, dashboard.html)
app.use(express.static(path.join(__dirname, 'public')));

// Middleware to log the requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.url}`);
    next();
});

// Handle Sign-Up POST request
app.post('/signup', async (req, res) => {
    try {
        // Hash the password before saving
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // Create a new user
        const newUser = new User({
            name: req.body.name,
            mobile: req.body.mobile,
            password: hashedPassword
        });

        // Save the user in MongoDB
        await newUser.save();
        res.send('Signed Up Successfully!');
    } catch (err) {
        console.error(err);
        res.status(500).send('Error occurred during sign up.');
    }
});

// Handle Login POST request
app.post('/login', async (req, res) => {
    try {
        const { mobile, password } = req.body;

        // Find the user by mobile and ration card number
        const user = await User.findOne({ mobile: mobile});

        if (user && await bcrypt.compare(password, user.password)) {
            // Redirect to dashboard if credentials match
            res.redirect('/main.html');
        } else {
            res.send('Invalid login credentials.');
        }
    } catch (err) {
        console.error(err);
        res.status(500).send('Error occurred during login.');
    }
});

// Start the server on port 3000
app.listen(3000, () => {
    console.log('Server is running on port 3000');
});