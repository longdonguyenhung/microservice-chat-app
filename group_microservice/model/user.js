import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    username: {//type: String
        type: String,
        index: true,
        unique: true,
        sparse: true
    }
}, {timestamps: true});

const Users = mongoose.model("user", userSchema);

export default Users;