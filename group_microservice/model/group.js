import mongoose from "mongoose";

const { Schema } = mongoose;
const groupSchema = new mongoose.Schema({
    
    topic: String,

    member: [{
        type: Schema.ObjectId,
        ref: 'User',
        required: 'Member is required',
        index: true, 
        }         
    ]
}, { timestamps: true })

const Group = mongoose.model('group', groupSchema);

export default Group;