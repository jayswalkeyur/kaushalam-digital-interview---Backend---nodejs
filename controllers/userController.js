'use strict';
const nodemailer = require("nodemailer");
const Task = require('../models/addTask');
const mongoose = require("mongoose"),
    User = mongoose.model("user"),
    session = mongoose.startSession,
    jwt = require("jsonwebtoken"),
    auth = require("../middleware/auth"),
    bcrypt = require("bcrypt");


exports.get_all_users = function (req, res) {
    User.find({}, function (err, user) {
        if (err)
            res.send(err);
        res.json(user);
    })
}


exports.find_user_byId = function (req, res) {
    User.findById(req.params.Id, function (err, user) {
        if (err)
            res.status(404).send("User Does not exist in the database");
        res.json(user);
    });
};

exports.register_a_user = async function (req, res) {
    try {
        // Get user input
        const { firstName, lastName, email, password, role } = req.body;

        // Validate user input
        if (!(firstName && lastName && email && password && role)) {
            return res.status(400).send("All input is required");
        }

        // Check if user already exists
        const oldUser = await User.findOne({ email: email.toLowerCase() });

        if (oldUser) {
            return res.status(409).send("User Already Exist. Please Login");
        }

        // Encrypt user password
        const encryptedPassword = await bcrypt.hash(password, 10);

        // Create user in the database
        const user = await User.create({
            firstName,
            lastName,
            email: email.toLowerCase(),
            password: encryptedPassword,
            role
        });

        // Check if TOKEN_KEY is defined
        if (!process.env.TOKEN_KEY) {
            throw new Error("TOKEN_KEY is not defined. Please set it in your environment variables.");
        }

        // Create token
        const token = jwt.sign(
            { user_id: user._id, email: user.email },
            process.env.TOKEN_KEY,
            { expiresIn: "2h" }
        );

        // Save user token
        user.token = token;

        // Return the new user with token
        return res.status(201).json(user);

    } catch (err) {
        // Handle any errors
        console.error(err); // Log the error for debugging
        return res.status(500).json({ message: err.message });
    }
}




exports.login_a_user = async function (req, res) {
    try {
        const { email, password } = req.body;

        // Validate user input
        if (!(email && password)) {
            return res.status(400).send("All input is required");
        }

        // Find the user by email
        const user = await User.findOne({ email });

        // Check if the user exists and if the password is correct
        if (!user || !(await bcrypt.compare(password, user.password))) {
            return res.status(400).send("Invalid Credentials");
        }

        // Check if the user's role is "admin"
        if (user.role !== "admin") {
            return res.status(403).send("Access denied: You must be an admin to log in.");
        }

        // Generate a token if the role is admin and credentials are correct
        const token = jwt.sign(
            { user_id: user._id, email: user.email },
            process.env.TOKEN_KEY,
            { expiresIn: "2h" }
        );

        // Save the token
        user.token = token;
        await user.save();

        // Respond with the token
        return res.status(200).json({
            token: token,
            message: "Login successful."
        });

    } catch (err) {
        // Handle errors and send a 500 response
        return res.status(500).json({ message: err.message });
    }
};


exports.addTask = async function (req, res) {
    console.log('Request body:', req.body); // Log the incoming request body
    try {
        // Destructure task properties from request body
        const { taskName, description, dueDate, status } = req.body;

        // Validate input
        if (!taskName || !description || !dueDate || !status) {
            return res.status(400).json({ message: 'All fields are required' });
        }

        // Create a new task using the Task model
        const newTask = await Task.create({
            taskName,
            description,
            dueDate,
            status,
        });

        // Log success and return the newly created task
        console.log('Task added successfully:', newTask);
        return res.status(201).json(newTask);
    } catch (err) {
        // Log the error for debugging
        console.error('Error adding task:', err); 
        
        // Check if error is from mongoose validation
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message });
        }
        
        return res.status(500).json({ message: 'Internal Server Error' });
    }
};

exports.getAllTask = async function (req, res) {
    try {
        const tasks = await Task.find();
        return res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}
//testing authorization
exports.auth = function (req, res) {
    res.status(200).send("Welcome to Api built with NodeJs");
}