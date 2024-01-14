const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');

// In-memory OTP storage using a Map
const otpStore = new Map();

// Create a transporter object using SMTP transport
const transporter = nodemailer.createTransport({
    service: 'gmail', // You can use other email services, like SMTP
    auth: {
        user: 'chamaksaathi@gmail.com', // Your email address
        pass: 'rjbb csue jwff ilrv' // Your email password or an app-specific password
    }
});

// Generate a random verification code (you can customize this as needed)
const generateVerificationCode = () => {
    return (Math.floor(1000 + Math.random() * 9000)).toString(); // Generates a 4-digit code
};


// Middleware to verify OTP
const verifyOtp = (req, res, next) => {
    try {
        const { phone, otp } = req.body;
        const storedOtp = otpStore.get(phone);

        if (!storedOtp) {
            return res.status(401).json("OTP not sent or expired. Please request a new OTP.");
        }

        if (otp !== storedOtp) {
            return res.status(401).json("Incorrect OTP. Please try again.");
        }

        // If OTP is correct, remove it from the storage
        otpStore.delete(phone);

        // Continue with the next middleware (e.g., login or registration)
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Middleware to verify Email OTP
const verifyEmailOtp = (req, res, next) => {
    try {
        const { email, otp } = req.body;
        const storedOtp = otpStore.get(email);

        if (!storedOtp) {
            return res.status(401).json("OTP not sent or expired. Please request a new OTP.");
        }

        if (otp !== storedOtp) {
            return res.status(401).json("Incorrect OTP. Please try again.");
        }

        // If OTP is correct, remove it from the storage
        otpStore.delete(email);

        // Continue with the next middleware (e.g., login or registration)
        next();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
};

// Send Email OTP Controller
const sendEmailOtp = async (req, res) => {
    try {
        // Check if the user is already registered
        const user = await User.findOne({ email: req.body.email });
        if (user) {
            return res.status(401).json("User already exists.");
        }

        // Generate a random verification code
        const verificationCode = generateVerificationCode();

        // Send the verification code to the user's email
        const mailOptions = {
            from: 'chamaksaathi@gmail.com', // Sender's email address
            to: req.body.email, // Recipient's email address
            subject: 'Verification Code',
            text: `Your verification code is: ${verificationCode}`
        };

        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                console.error('Error sending email: ', error);
                return res.status(500).json({ error: "Error sending email" });
            } else {
                console.log('Email sent: ' + info.response);
                // Store the verification code in memory (use a unique key like email)
                otpStore.set(req.body.email, verificationCode);

                console.log(otpStore)
                res.status(200).send('OTP Sent');
            }
        });
    } catch (err) {
        // Handle errors and send an error response with details
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}


// Register Controller
const register = async (req, res) => {
    const { name, email, phone, password } = req.body;

    if (!name || !email || !phone || !password) {
        return res.status(400).json({ error: 'Please add all Fields' });
    }


    // Hash Password
    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    // Create New User
    const newUser = new User({
        name: req.body.name,
        phone: req.body.phone,
        email: req.body.email,
        isEmailVerified: true,
        password: hashedPassword,
    });

    try {
        const savedUser = await newUser.save();
        // JWT Sign
        const accessToken = jwt.sign({
            id: savedUser._id,
        },
            process.env.JWT_SECRET,
            { expiresIn: '1d' });


        const { password, ...others } = savedUser._doc;

        return res.status(200).json({ ...others, accessToken });

    } catch (err) {
        console.error(err)
        return res.status(500).json(err);
    }
}

const login = async (req, res) => {
    const { userIdentifier } = req.body;

    try {
        // Try to find the user by email
        const user = await User.findOne({ $or: [{ email: userIdentifier }, { phone: userIdentifier }] });

        if (!user) {
            return res.status(401).json({ message: 'User not found' });
        }

        // Check if Passwords match
        if (!(await bcrypt.compare(req.body.password, user.password))) {
            return res.status(401).json("Incorrect Password")
        }

        // JWT Sign
        const accessToken = jwt.sign({
            id: user._id,
        },
            process.env.JWT_SECRET,
            { expiresIn: '1d' });

        const { password, ...others } = user._doc;

        return res.status(200).json({ ...others, accessToken });

    } catch (err) {
        console.error(err);
        res.status(500).json(err);
    }
}


// Below two Controllers will be used when Mobile OTP Authentication is implemented

const sendRegisterOtp = async (req, res) => {
    try {
        // Check if the user is already registered
        const user = await User.findOne({ phone: req.body.phone });
        if (user) {
            return res.status(401).json("User already exists.");
        }
        // Sending the OTP
        // Generate a random 6-digit number
        const otp = (Math.floor(100000 + Math.random() * 900000)).toString();

        // Store OTP in memory (use a unique key like phone number or user ID)
        otpStore.set(req.body.phone, otp);

        // Code to send the OTP to the Phone Number will come here
        console.log(otpStore);

        // Success Response
        res.status(200).send('OTP Sent');
    } catch (err) {
        // Handle errors and send an error response with details
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

const sendLoginOtp = async (req, res) => {
    try {
        // Check if user exists
        const user = await User.findOne({ phone: req.body.phone });
        if (!user) {
            return res.status(401).json("User does not exist");
        }

        // Sending the OTP
        // Generate a random 6-digit number
        const otp = (Math.floor(100000 + Math.random() * 900000)).toString();
        // Store OTP in memory (use a unique key like phone number or user ID)
        otpStore.set(req.body.phone, otp);
        console.log(otpStore);

        // Success Response
        res.status(200).send('OTP Sent');
    } catch (err) {
        // Handle errors and send an error response with details
        console.error(err);
        res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {
    otpStore,
    sendRegisterOtp,
    sendLoginOtp,
    sendEmailOtp,
    register,
    login,
    verifyEmailOtp,
};