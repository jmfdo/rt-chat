import { generateToken } from '../lib/utils.js'
import User from '../models/user.model.js'
import bcrypt from 'bcryptjs'

export const signup = async(request, response) => {
  try {
    const { email, fullName, password} = request.body

    if (!email || !fullName || !password) return response.status(400).json({ message: 'All fields are required'})

    if (password < 6) return response.status(400).json({ message: 'Password must be al least 6 characters'})

    const user = await User.findOne({ email })

    if (user) return response.status(400).json({ message: 'Email already exist'})

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
      response.status(400).json({ message: 'Invalid user data'})
    }
  } catch (error) {
    console.error(`Error in signup controller ${error.message}`)
    response.status(500).json({ message: 'Internal Server Error' })
  }
}

export const login = (request, response) => {
  response.send('Login route')
}

export const logout = (request, response) => {
  response.send('Logout route')
}