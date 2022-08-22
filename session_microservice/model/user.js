import mongoose from "mongoose";

const userSessionSchema = new mongoose.Schema({
    username: {//type: String
        type: String,
        index: true,
        unique: true,
        sparse: true
    }
}, {timestamps: true});

const UserSession = mongoose.model("UserSession", userSessionSchema);

export default UserSession;