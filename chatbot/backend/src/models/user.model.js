import mongoose from "mongoose";
import bcrypt from "bcrypt";

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true
    },

    email: {
        type: String,
        required: true,
        unique: true
    },

    password: {
        type: String,
        required: false
    }
});


userSchema.pre("save", async function () {
    // Google user ke paas password nahi hoga
    if (!this.isModified("password") || !this.password) return;

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});


userSchema.methods.comparePassword = async function (candidatePassword) {
    if (!this.password) return false;

    return await bcrypt.compare(candidatePassword, this.password);
};


const userModel = mongoose.model("user", userSchema);

export default userModel;