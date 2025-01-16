import mongoose from "mongoose"

const friendSchema = new mongoose.Schema({
    requestTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    requestFrom: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
    },
    avatar: {
        type: String,
        default: "https://www.google.com/imgres?q=default%20user%20logo&imgurl=https%3A%2F%2Fstatic.vecteezy.com%2Fsystem%2Fresources%2Fpreviews%2F009%2F292%2F244%2Fnon_2x%2Fdefault-avatar-icon-of-social-media-user-vector.jpg&imgrefurl=https%3A%2F%2Fwww.vecteezy.com%2Ffree-vector%2Fdefault-user&docid=IXUOFmCbuSP32M&tbnid=bhXONIl2bblF7M&vet=12ahUKEwj6kZzaivOKAxV7dvUHHSClF98QM3oECBoQAA..i&w=980&h=980&hcb=2&ved=2ahUKEwj6kZzaivOKAxV7dvUHHSClF98QM3oECBoQAA",
    },
    status: {
        type: Number,
        enum: [
            0, 1, 2, 3,
        ],
    }
},{timestamps: true }
)

export const friends = mongoose.model("friends",friendSchema);