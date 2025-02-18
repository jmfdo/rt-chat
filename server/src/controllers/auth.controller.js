import { generateToken } from '../lib/utils.js'
import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'
import cloudinary from '../lib/cloudinary.js'

export const signup = async (request, response) => {
  try {
    const { email, fullName, password } = request.body

    if (!email || !fullName || !password) return response.status(400).json({ message: 'All fields are required' })

    if (password < 6) return response.status(400).json({ message: 'Password must be al least 6 characters' })

    const user = await User.findOne({ email })

    if (user) return response.status(400).json({ message: 'Email already exist' })

    const salt = await bcrypt.genSalt(10)
    const hashedPassword = await bcrypt.hash(password, salt)

    const newUser = new User({
      fullName,
      email,
      password: hashedPassword
    })

    if (newUser) {
      // Generate JWT
      generateToken(newUser._id, response)
      await newUser.save()

      response.status(201).json({
        _id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        profilePic: newUser.profilePic
      })
    } else {
      response.status(400).json({ message: 'Invalid user data' })
    }
  } catch (error) {
    console.error(`Error in signup controller ${error.message}`)
    response.status(500).json({ message: 'Internal Server Error' })
  }
}

export const login = async (request, response) => {
  const { email, password } = request.body
  try {
    const user = await User.findOne({ email })

    if (!user) {
      return response.status(400).json({ message: 'Invalid credentials' })
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password)

    if (!isPasswordCorrect) {
      return response.status(400).json({ message: 'Invalid credentials' })
    }

    generateToken(user._id, response)

    response.status(200).json({
      _id: user._id,
      fullName: newUser.fullName,
      email: newUser.email,
      profilePic: newUser.profilePic
    })
  } catch (error) {
    console.error(`Error in login controller ${error.message}`)
    response.status(500).json({ message: 'Internal Server Error' })
  }
}

export const logout = (request, response) => {
  try {
    response.cookie('jwt', '', { maxAge: 0 })
    response.status(200).json({ message: 'Logget out successfully'})
  } catch (error) {
    console.error(`Error in login controller ${error.message}`)
    response.status(500).json({ message: 'Internal Server Error' })
  }
}

export const updateProfile = async (request, response) => {
  try {
    const { profilePic } = request.body
    const userId = request.user._id

    if (!profilePic) return response.status(400).json({ message: 'Profile pic is required' })

    const uploadResponse = await cloudinary.uploader.upload(profilePic)
    const updatedUser = await User.findByIdAndUpdate(userId, { profilePic: uploadResponse.secure_url }, { new: true })

    response.status(200).json({ message: 'Updated user' })
  } catch (error) {
    console.error(`Error in update profile ${error}`)
    response.status(500).json({ message: 'Internal Server Error' })
  }
}