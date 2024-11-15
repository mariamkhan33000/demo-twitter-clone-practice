import { generateSaltCookieToken } from "../lib/utils/generateToken.js";
import User from "../models/userModel.js";
import bcrypt from 'bcryptjs'

export const signUpUser = async (req, res) => {
    try {
        const {username, fullName, email, password} = req.body
        if(!username || !fullName || !email || !password) {
            return res.status(400).json({ error: "Invalid format" });
        }
        const exisitinguser = await User.findOne({ username })
        if(exisitinguser) {
            return res.status(400).json({ error: "username already exit" });
        }
        const exisitEmail = await User.findOne({ email }) 
        if (exisitEmail) {
            return res.status(400).json({ error: "Email already Exisit" });
        }

        if (password.length < 6) {
			return res.status(400).json({ error: "Password must be at least 6 characters long" });
		}

        const salt = await bcrypt.genSaltSync(10)
        const hashPassword = await  bcrypt.hash(password, salt)

        const newUser  = new User({
            username,
            fullName,
            email, 
            password : hashPassword
        })
        if(newUser) {
            generateSaltCookieToken(newUser._id, res)

            await newUser.save();

            res.status(200).json({
                _id : newUser._id,
                fullName: newUser.fullName,
				username: newUser.username,
				email: newUser.email,
				followers: newUser.followers,
				following: newUser.following,
				profileImg: newUser.profileImg,
				coverImg: newUser.coverImg,
            })
        } else {
			res.status(400).json({ error: "Invalid user data" });
		}
    } catch (error) {
      console.log("Error in signUpUser", error.message);
      res.status(500).json({error: "Internal server error"})
    }
}

export const logInUser = async (req, res) => {
    try {
        const { username, password} = req.body
        const user = await User.findOne({username})
        const isPasswordCorrect = await bcrypt.compare(password, user?.password || "")

        if (!user || !isPasswordCorrect) {
			return res.status(400).json({ error: "Invalid username or password" });
        }

        generateSaltCookieToken(user._id, res);

		res.status(200).json({
			_id: user._id,
			fullName: user.fullName,
			username: user.username,
			email: user.email,
			followers: user.followers,
			following: user.following,
			profileImg: user.profileImg,
			coverImg: user.coverImg,
		});
    } catch (error) {
        console.log("Error in logInUser", error.message);
      res.status(500).json({error: "Login server error"})
    }
}

export const logOutUser = async (req, res) => {
    try {
        res.cookie('jwt', '', {maxAge: 0})
        res.status(200).json({ message: "Logged out successfully" });
    } catch (error) {
        console.log("Error in LogOutUser", error.message);
      res.status(500).json({error: "LogOut server error"})
    }
}

export const getMe = async (req, res) => {
    try {
        const user = await User.findById(req.user._id).select("-password")
        res.status(200).json(user);
    } catch (error) {
        console.log("Error in getME", error.message);
      res.status(500).json({error: "getMe server error"})
    }
}