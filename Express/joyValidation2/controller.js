const express = require("express");
const bcrypt = require("bcrypt");
const loginModel = require("./model");
const { register, login } = require("./validateUser");
const jwt = require("jsonwebtoken");

// show all registered users
const users = async (req, res) => {
  try {
    const user = await loginModel.find();
    res.status(200).json({ message: "All Logged In Users", data: user });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// register new user
const signUp = async (req, res) => {
  try {
    // extract error object from register function
    const { error } = await register(req.body);
    // validate the error object
    if (error) {
      console.log(error);
      res.status(401).json({ message: error.details[0].message });
    }

    // get the email from the request body of the user data in the collection
    const emailChecker = await loginModel.findOne({ email: req.body.email });
    // validate the email
    if (emailChecker) {
      res.status(400).json({ message: "Email already exists" });
    }

    // set the number of times to encrypt the password
    saltRounds = 10;
    // Generate the salt
    saltedPassword = await bcrypt.genSalt(saltRounds);
    // hash the salted password using bcrypt.hash() method
    hashedPassword = await bcrypt.hash(req.body.password, saltedPassword);

    // created a data object
    const data = {
      username: req.body.username,
      email: req.body.email,
      password: hashedPassword,
    };

    // validate the data
    if (!data) {
      res.status(400).json({ message: "invalid data" });
    }

    // create a user
    const user = await loginModel.create(data);
    res.status(200).json({ data: user });
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
};

// Sign user in users
const signIn = async (req, res) => {
  try {
    // extract error object from login function
    const { error } = await login(req.body);
    // validate the error
    if (error) {
      res.status(401).json({ message: err.message });
    }

    //  // get the email from the request body of the user data in the collection
    const emailChecker = await loginModel.findOne({ email: req.body.email });
    // validate email
    if (!emailChecker) {
      res.status(401).json({ message: "Invalid Email" });
    }
    // compare the current user password and the one in the collection.
    const passwordCheck = await bcrypt.compare(
      req.body.password,
      emailChecker.password
    );

    // validate the password
    if (!passwordCheck) {
      res.status(401).json({ message: "Incorrect Password" });
    }
    //   res.status(200).json({ message: "LoggedIn Successfully" });

    // Authenticating the user with jsonwebtoken(jwt)
    const token = jwt.sign({ _id: loginModel._id }, process.env.TOKEN_SECRETE);
    // send the token to the header
    res.header("auth-token").send(token);
  } catch (error) {
    res.json({ message: error.message });
  }
};

// create a private route that the user can access if they logged in with an assigned token
const homepage = (req, res) => {
  res.status(200).json({
    message: "Welcome!!! You are verified and can view our homepage.s",
  });
};

module.exports = {
  users,
  signUp,
  signIn,
  homepage,
};
