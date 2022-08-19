import mongoose from 'mongoose';

const { Schema } = mongoose;

const messageSchema = new Schema({
    conversation: {
        type: Schema.ObjectId,
        ref: 'Group',
        required: 'Group is required',
    },

    owner: {
        type: Schema.ObjectId,
        ref: 'User',
        required: 'User is required',
    },

    content: String,
}, { timestamps: true });

messageSchema.index({ createdAt: true });

const Message = mongoose.model('message', messageSchema);

export default Message;