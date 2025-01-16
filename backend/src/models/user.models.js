import mongoose from "mongoose";
import bcrypt from "bcrypt";
const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    password: {
        type: String,
        required: true,
        minLength : [6,"Password must be atleast 6 characters long"],
    },
    avatar: {
        type: String,
        default: "https://www.google.com/imgres?q=default%20user%20logo&imgurl=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F009%2F292%2F244%2Fnon_2x%2Fdefault-avatar-icon-of-social-media-user-vector.jpg&imgrefurl=https%3A%2F%2Fwww.vecteezy.com%2Ffree-vector%2Fdefault-user&docid=IXUOFmCbuSP32M&tbnid=bhXONIl2bblF7M&vet=12ahUKEwj6kZzaivOKAxV7dvUHHSClF98QM3oECBoQAA..i&w=980&h=980&hcb=2&ved=2ahUKEwj6kZzaivOKAxV7dvUHHSClF98QM3oECBoQAA",
    },
    totalLikes: {
        type: Number,
        default: 0,
    },
    totalComments: {
        type: Number,
        default: 0,
    },
    totalPosts: {
        type: Number,
        default: 0,
    },
    friends: {
        type: [mongoose.Schema.Types.ObjectId],
        ref: "Friends",
        default: [],
    },   
})
userSchema.methods.comparePassword = async function (password) {
    return bcrypt.compare(password, this.password);
};
export const User = mongoose.model("User",userSchema);