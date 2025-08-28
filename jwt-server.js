
// Live Server.
// Used to help protect admin and user pages.

const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const fetch = require('node-fetch');
const jwt = require('jsonwebtoken');
const path = require('path');

const app = express();
const PORT = 3001;

const SECRET_KEY = 'secret_key';

// Used for cross origin, allowing from any port for simplicity.
app.use(cors({
    origin: '*',
    methods: ['GET', 'POST'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true
}));
app.use(bodyParser.json());

// Used to create a JWT token for protecting pages based on admin or user.
function generateToken(username, role, userID) {
    // Since users need an userID, include it with the token. Will be handled accordingly with admins.
    const payload = { username, role, userID };
    const options = { expiresIn: '1h' };
    const token = jwt.sign(payload, SECRET_KEY, options);
    return token;
}

// Used to check the login endpoint and handle it accordingly.
app.post('/login', async (req, res) => {
    const { username, password, role } = req.body;

    if (!username || !password || !role) {
        return res.status(400).json({ message: 'Username, password, and role are required' });
    }

    // Used to handle the admin and user roles along with checking to see if there is a user ID.
    try {
        // Handle between admin and user along with having a user ID for a user (not an admin).
        let validationEndpoint;
        let userID = null;
        if (role === 'admin') {
            validationEndpoint = 'http://localhost:3000/admin/login';
        } else if (role === 'user') {
            validationEndpoint = 'http://localhost:3000/user/login';
        } else {
            return res.status(400).json({ message: 'Invalid role' });
        }

        // Send the login request.
        const response = await fetch(validationEndpoint, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ username, password })
        });

        // Check to see if the login is okay or not.
        if (!response.ok) {
            const errorData = await response.json();
            return res.status(response.status).json({ message: errorData.message });
        }

        const data = await response.json();

        // Check to see what the role is. Don't need an ID if logged in as admin.
        if (role === 'admin') {
            userID = 'admin';
        } else if (role === 'user') {
            userID = data.userID;
            if (!userID) {
                return res.status(400).json({ message: 'User ID is missing from the response' });
            }
        }

        // Create a token for the admin or user to be used for secure login.
        const token = generateToken(username, role, userID);

        res.json({ token });

    } catch (error) {
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Used to check and verify if a token exist.
function authenticateToken(req, res, next) {
    const token = req.headers['authorization']?.split(' ')[1]; // Extract token

    // Check to see if the token is missing.
    if (!token) {
        return res.status(401).json({ message: 'Access token missing' }); // Token missing
    }

    // Verify the token and attach admin/user to it.
    jwt.verify(token, SECRET_KEY, (err, user) => {
        if (err) {
            return res.status(403).json({ message: 'Invalid or expired token' });
        }
        req.user = user;
        next();
    });
}

// Dashboard route for verifying that the token exists (Admin access only).
app.get('/dashboard', authenticateToken, (req, res) => {
    if (req.user.role === 'admin') {
        res.sendFile(path.join(__dirname, 'dashboard.html'), (err) => {
            if (err) {
                res.status(500).send('Internal Server Error');
            }
        });
    } else {
        res.status(403).json({ message: 'Access forbidden: Admins only' });
    }
});

// Quiz route for verifying that the token exists (Users access only).
app.get('/quiz', authenticateToken, (req, res) => {
    // Double check to make sure that the user is access the quiz and not the admin.
    if (req.user.role === 'user') {
        const userID = req.user.userID;
        res.json({ message: 'Quiz access granted', userID: userID });
    } else {
        res.status(403).json({ message: 'Access forbidden: Admins cannot access the quiz' });
    }
});

// Used to validate a token.
app.post('/validate-token', authenticateToken, (req, res) => {
    res.json({ message: 'Token is valid', user: req.user });
});

// Start the server and put it on port 3001.
app.listen(PORT, () => {
    console.log(`JWT server is running on port ${PORT}`);
});
