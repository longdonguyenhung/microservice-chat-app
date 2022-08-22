import mongoose from "mongoose";

const { Schema } = mongoose;
const connectionSchema = new mongoose.Schema({

    userSession: {
        type: Schema.ObjectId,
        ref: 'UserSession',
        required: 'UserSession is required',
    },

    address: String,

}, { timestamps: true })

const Connection = mongoose.model('Connection', connectionSchema);

export default Connection;