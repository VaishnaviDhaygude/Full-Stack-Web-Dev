const User = require('../Models/users');

exports.signUp = async (req, res) => {
    try {
        const existingUser = await User.findOne({ email: req.body.email });

        if (existingUser) {
            res.status(200).json({ success: false, message: 'Email already exists' });
        } else {
            const newUser = new User({
                fullname: req.body.fullname,
                email: req.body.email,
                password: req.body.password
            });

            const savedUser = await newUser.save();
            res.status(200).json({ success: true, user: savedUser });
        }
    } catch (error) {
        console.error('Error in signUp:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};

exports.logIn = async (req, res) => {
    try {
        const payload = {
            email: req.body.email,
            password: req.body.password
        };

        const verifiedUser = await User.findOne(payload);

        if (verifiedUser) {
            res.status(200).json({ success: true, user: verifiedUser });
        } else {
            res.status(200).json({ success: false, message: 'Invalid credentials' });
        }
    } catch (error) {
        console.error('Error in logIn:', error);
        res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
};
