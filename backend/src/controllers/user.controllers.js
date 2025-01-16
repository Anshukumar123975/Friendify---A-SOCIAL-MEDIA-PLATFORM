import { User } from "../models/user.models.js"
import bcrypt from "bcrypt"
import jwt from "jsonwebtoken"
import multer from "multer";
import path from "path"
import { uploadOnCloudinary } from "../utils/cloudinary.js";

const JWT_SECRET = "anshu";
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
      cb(null, "uploads/");
  },
  filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
      cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});
export const registerController = async(req,res) => {
    const {username, email, password} = req.body;
    const avatar = req.file?.path;

    if(!username || !email || !password){
        return res.status(400).json("Username, email and password are mandatory");
    }

    if(password.length < 6){
        return res.status(400).json({message: "Password must be atleast 6 characters long."});
    }

    try{
        const existingUser = await User.findOne({ email });

        if (existingUser) {
            return res.status(409).json({ message: "Email is already registered" });
        }

        const existingUsername = await User.findOne({ username });
        if (existingUsername) {
          return res.status(409).json({ message: "Username is already taken" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        let avatarUrl = "https://www.google.com/imgres?q=default%20user%20logo&imgurl=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F009%2F292%2F244%2Fnon_2x%2Fdefault-avatar-icon-of-social-media-user-vector.jpg&imgrefurl=https%3A%2F%2Fwww.vecteezy.com%2Ffree-vector%2Fdefault-user&docid=IXUOFmCbuSP32M&tbnid=bhXONIl2bblF7M&vet=12ahUKEwj6kZzaivOKAxV7dvUHHSClF98QM3oECBoQAA..i&w=980&h=980&hcb=2&ved=2ahUKEwj6kZzaivOKAxV7dvUHHSClF98QM3oECBoQAA";
        if (req.file) {
            const localFilePath = req.file.path;
            const uploadResponse = await uploadOnCloudinary(localFilePath);

            if (uploadResponse) {
                avatarUrl = uploadResponse.url; // Use the uploaded file's Cloudinary URL
            }
        }

        // Create the user
        const newUser = new User({
            username,
            email,
            password: hashedPassword,
            avatar: avatarUrl, // Save Cloudinary avatar URL in the database
        });

        const token = jwt.sign(
            { userId: newUser._id, email: newUser.email},
            JWT_SECRET,
            { expiresIn: "1h" } // Token will expire in 1 hour
          );
        await newUser.save();

        res.status(201).json({
            message: "User registered successfully",
            user: {
              id: newUser._id,
              username: newUser.username,
              email: newUser.email,
              avatar: newUser.avatar,
              totalLikes: newUser.totalLikes,
              totalComments: newUser.totalComments,
              totalPosts: newUser.totalPosts,
              friends: newUser.friends,
            },
            token,
          });
    } catch (error) {
      console.error("Error during registration:", error);
      res.status(500).json({ message: "Internal server error" });
    }
}
User.schema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};
// User.schema.methods.generateAuthToken = function () {
//   const token = jwt.sign({ _id: this._id }, JWT_SECRET, { expiresIn: '1h' });
//   return token;
// };
export const loginController = async(req,res) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.toLowerCase();
    
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
   
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
        return res.status(400).json({ message: 'Invalid credentials' });
    }
    const token = jwt.sign(
      { userId: user._id, email: user.email},
      JWT_SECRET,
      { expiresIn: "24h" } // Token will expire in 1 hour
    );

    res.status(200).json({
        message: 'Login successful',
        user: { id: user._id, username: user.username },
        token
    });
} catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
}
}

export const searchUser = async(req,res) => {
  const {query} = req.query;
  try{
    const user = await User.findOne({username:query});
    if (!user) {
      return res.status(404).json({ message: 'User not found' }); // Handle case where user is not found
    } 
    res.status(200).json({
      user
    })
  } catch(error){
    res.status(500).json({ message: 'Server error', error: error.message });
  }
}

export const userDetails = async(req,res) => {
  const {userId} = req.query;
  try{
    const user = await User.findOne({_id:userId});
    res.status(200).json({
      user: {
        username: user.username,
        avatar:user.avatar,
      },
    })
  }
  catch(error){
    res.status(500).json({message: 'Failed to fetch user Details', error: error.message});
  }
}