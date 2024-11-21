import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import mongoose from 'mongoose';

// Register User
export const registerUser = async (req: any, res: any) => {
  const { username, email, password } = req.body;

  try {
    const userExists = await User.findOne({ email });

    if (userExists) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
    });

    await newUser.save();

    const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    res.status(201).json({ message: 'User created!', token });
  } catch (error) {
    console.error('Error during user registration:', error); // Log the error for debugging

    if (error instanceof mongoose.Error.ValidationError) {
      return res.status(400).json({ message: 'Validation error', details: error.errors });
    }

    res.status(500).json({ message: 'Server error' });
  }
};

// Login User
export const loginUser = async (req: any, res: any) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET as string, { expiresIn: '1h' });

    res.status(200).json({ message: 'Login successful', token, username: user.username });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Get User Data
export const getUserData = async (req: any, res: any) => {
  const { username } = req.params;
  console.log('Fetching user data for username:', username); // Debugging
  try {
    const user = await User.findOne({ username });
    if (!user) {
      console.log('User not found'); // Debugging
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    console.error('Error fetching user data:', error); // Debugging
    res.status(500).json({ message: 'Server error' });
  }
};
