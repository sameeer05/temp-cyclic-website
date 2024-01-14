const router = require('express').Router();
const {
    otpStore,
    sendRegisterOtp,
    sendLoginOtp,
    register,
    login,
    sendEmailOtp,
    verifyEmailOtp,
} = require('../controllers/authController');

// Will be used when Mobile OTP login is implemented

/*

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

*/

// Send Register OTP route
router.post('/send-register-otp', sendRegisterOtp);

// Send Login OTP Route
router.post('/send-login-otp', sendLoginOtp);

// Send E-mail OTP Route
router.post('/send-email-otp', sendEmailOtp);

// Register Route
router.post('/register', verifyEmailOtp, register);

// Login Route
router.post('/login', login);

module.exports = router;