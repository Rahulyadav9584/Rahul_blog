import bcryptjs from 'bcryptjs';
import { errorHandler } from '../utils/error.js';
import User from '../models/user.model.js';

// Test Route Handler (for testing purposes)
export const test = (req, res) => {
  res.json({ message: "API is working" });
};

export const updateUser = async (req, res, next) => {
  const { userId } = req.params;
  const { username, email, password, profilePicture } = req.body;

  // Authorization Check: Ensure the user can only update their own profile
  if (req.user.id !== userId) {
    return next(errorHandler(403, 'You are not allowed to update this user'));
  }

  // Initialize an object to hold fields to be updated
  const updatedFields = {};

  // Validate and prepare password for update
  if (password) {
    if (password.length < 6) {
      return next(errorHandler(400, 'Password must be at least 6 characters long'));
    }
    updatedFields.password = bcryptjs.hashSync(password, 10);
  }

  // Validate and prepare username for update
  if (username) {
    const usernameErrors = validateUsername(username);
    if (usernameErrors) {
      return next(errorHandler(400, usernameErrors));
    }
    updatedFields.username = username;
  }

  // Validate email (if provided) and add to update fields
  if (email) {
    if (!isValidEmail(email)) {
      return next(errorHandler(400, 'Invalid email format'));
    }
    updatedFields.email = email;
  }

  // Add profile picture to update fields
  if (profilePicture) {
    if (!isValidUrl(profilePicture)) {
      return next(errorHandler(400, 'Invalid profile picture URL'));
    }
    updatedFields.profilePicture = profilePicture;
  }

  try {
    // Update the user in the database
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: updatedFields },
      { new: true }
    );

    // Omit the password from the response
    const { password, ...userWithoutPassword } = updatedUser._doc;

    res.status(200).json(userWithoutPassword);
  } catch (error) {
    next(error);
  }
};

// Helper function to validate username
const validateUsername = (username) => {
  if (username.length < 7 || username.length > 20) {
    return 'Username must be between 7 and 20 characters long';
  }
  if (username.includes(' ')) {
    return 'Username cannot contain spaces';
  }
  if (username !== username.toLowerCase()) {
    return 'Username must be in lowercase';
  }
  if (!/^[a-zA-Z0-9]+$/.test(username)) {
    return 'Username can only contain letters and numbers';
  }
  return null;
};

// Helper function to validate email format
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Helper function to validate URL format
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

export const deleteUser=async(req,res,next)=>{
  if(!req.user.isAdmin && req.user.id!=req.params.userId){
    return next(errorHandler(403,'you are not allowed to delete this user'));
  }
  try {
    await User.findByIdAndDelete(req.params.userId);
    res.status(200).json('user has been deleted');
  } catch (error) {
    next(error);
  }
}

export const signout = (req, res, next) => {
  try {
    res
      .clearCookie('access_token')
      .status(200)
      .json('User has been signed out');
  } catch (error) {
    next(error);
  }
};

export const getUsers=async(req,res,next)=>{
  if(!req.user.isAdmin){
    return next(errorHandler(403,'you are not allowed to see all users'));
  }
   try {
    const startIndex=parseInt(req.query.startIndex) || 0;
    const limit=parseInt(req.query.limit) || 9;
    const sortDirection=req.query.sort === 'asc'?1:-1;

    const users=await User.find()
      .sort({createdAt:sortDirection})
      .skip(startIndex)
      .limit(limit);

      const usersWithoutPassword=users.map((user)=>{
        const {password,...rest}=user._doc;
        return rest;
      })

      const totalUsers=await User.countDocuments();
      const now=new Date();

      const oneMonthAgo=new Date(
        now.getFullYear(),
        now.getMonth()-1,
        now.getDate()
      )
      const lastMonthUsers=await User.countDocuments({
        createdAt:{$gte:oneMonthAgo},
      })

      res.status(200).json({
        users:usersWithoutPassword,
        totalUsers,
        lastMonthUsers
      })
    
   } catch (error) {
     next(error);
   }
}


export const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.userId);
    if (!user) {
      return next(errorHandler(404, 'User not found'));
    }
    const { password, ...rest } = user._doc;
    res.status(200).json(rest);
  } catch (error) {
    next(error);
  }
};