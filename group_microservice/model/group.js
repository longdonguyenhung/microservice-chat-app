import mongoose from "mongoose";

const { Schema } = mongoose;
const groupSchema = new mongoose.Schema({
    
    title: String,

    descrition: String,

    owner: { // _id of the owner user.
        type: Schema.ObjectId,
        ref: 'User',
        required: 'Owner is required',
        index: true,      

    },    

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