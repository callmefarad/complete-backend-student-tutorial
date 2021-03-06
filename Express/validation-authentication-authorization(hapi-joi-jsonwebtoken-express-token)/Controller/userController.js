const loginModel = require("../Model/userModel");
const jwt = require("jsonwebtoken");
const expressJwt = require("express-jwt");
const bcrypt = require("bcrypt");
const { register, login } = require("../validateUser");
// require('cookie-parser');



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
    const oldUser = await loginModel.findOne({ email: req.body.email });
    // validate the email
    if (oldUser) {
      res
        .status(400)
        .json({ message: `User with ${req.body.email} already exists` });
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
      res.status(401).json({ message: error.message });
    }

    //  // get the email from the request body of the user data in the collection
    const user = await loginModel.findOne({ email: req.body.email });
    // validate email
    if (!user) {
      res.status(401).json({ message: "Invalid User" });
    }
    // compare the current user password and the one in the collection.
    const passwordCheck = await bcrypt.compare(
      req.body.password,
      user.password
    );

    // validate the password
    if (!passwordCheck) {
      res.status(401).json({ status: "error", message: "Incorrect Password" });
    }

    // Authenticating the user with jsonwebtoken(jwt)
    const token = jwt.sign(
      { _id: loginModel._id, email: loginModel.email },
      process.env.TOKEN_SECRETE
    );
      res.status(200).json({ user, token: token});
    // send the token to the header
    // res.header("auth-token").send(token);
  } catch (error) {
    res.json({ message: error.message });
  }
};

// a middleware for creating private route
const isSignedIn = expressJwt({
  secret: process.env.TOKEN_SECRETE,
  userProperty: "auth",
  algorithms: ['HS256'],
});

// show all registered users
const users = async (req, res) => {
  try {
    const user = await loginModel.find();
    res.status(200).json({ message: "All Registered Users", data: user });
  } catch (error) {
    res.status(404).json({ message: error.message });
  }
};

// delete a user
const delUser = async (req, res) => {
  try{
    const userId = req.params.id;
  if(!userId){
    res.send("Incorrect User ID.")
  }
  const user = await loginModel.findById(userId);
  const deletedUser = await loginModel.deleteOne(user);
  if(!deletedUser){
    res.send("There is a problem deleting this user.")
  }res.status(200).json({message: "User Deleted Successfully"})
  }catch(error) {
    res.status(400).json({message: error.message})
  }
}

// update a user
const updateUsers = async (req, res) =>{
  try{
    userId = req.params.id;
    if(!userId){
      res.send("Invalid UserId.")
    }
    // const updateUser = await loginModel.findById(userId);
    const updatedUser = await loginModel.findByIdAndUpdate(userId)
    res.status(200).json({message: "User Updated Successfully", data: updatedUser});
  }catch(error){
    res.json({message: error.message})
  }
}

// create a private route that the user can access if they logged in with an assigned token
const homepage = (req, res) => {
  res.status(200).json({
    message: "Welcome!!! You are verified and can view our homepage",
  });
};

module.exports = {
  users,
  delUser,
  updateUsers,
  signUp,
  signIn,
  isSignedIn,
  homepage,
};
