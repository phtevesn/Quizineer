// Server code to handle sending a email for the contact page along with sending an email.
// for when a user needs to be sent their password.

const express = require('express');
const nodemailer = require('nodemailer');
const bodyParser = require('body-parser');
const path = require('path');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
const port = 3002;

// Used for cross origin when dealing with front end and back end on different.
app.use(cors());

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve the html files from their pathing
app.use(express.static(path.join(__dirname)));

// Using nodemailer to handle email middle man.
// Note: needs to use a bypass temp password.
const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: 'quizprojectemail@gmail.com',  // Your email here
        pass: 'rywl xism gypy fsgd'  // Your Gmail App Password here
    }
});

// Used for sending emails from the contact page.
app.post('/send-email', (req, res) => {
    const { firstname, lastname, email, phone, subject } = req.body;

    // Basic input validation to ensure required fields are present.
    if (!firstname || !lastname || !email || !subject) {
        return res.status(400).send({ message: 'Missing required fields' });
    }

    const mailOptions = {
        from: 'quizprojectemail@gmail.com',  // Sender address
        to: 'weeniehutjrs.131@gmail.com',  // Recipient address
        subject: `Contact Form Submission from ${firstname} ${lastname}`,  // Subject of the email
        text: `Name: ${firstname} ${lastname}\nEmail: ${email}\nPhone: ${phone}\nMessage: ${subject}`
    };

    // Sends the email.
    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send({ message: 'Error sending email', error });
        }
        return res.status(200).send({ message: 'Email sent successfully', info });
    });
});

// Used to send emails for when users need their passwords. The management.html handles
// generating the password, this just sends it to the user.
app.post('/send-new-password-email', async (req, res) => {
    const { username, email, tempPassword } = req.body;
    if (!username || !email || !tempPassword) {
        return res.status(400).send({ message: 'Username, email, and tempPassword are required.' });
    }

    const mailOptions = {
        from: 'quizprojectemail@gmail.com',
        to: email,
        subject: 'Your Username & Password',
        text: `Hello,

Your username is: ${username}
Your password is: ${tempPassword}

Please use this to log in to your account.

Thank you.`
    };

    transporter.sendMail(mailOptions, (error, info) => {
        if (error) {
            return res.status(500).send({ message: 'Error sending email', error });
        }
        res.status(200).send({ message: 'Email sent successfully' });
    });
});

// Starts the server and lists the port it is running on which should be 3002.
app.listen(port, () => {
    console.log(`Email server is running on port ${port}`);
});