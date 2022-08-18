import mongoose from "mongoose";


//this schema will change overtime, so how to manage if a connection is lost
/*
    Scenario 1: User have disconected and connect to the same gateway
    Scenario 2: User disconnected and connect to the other gateway
    Scenario 3: Gateway down and we have to redirect all the connection to the other gateway
    Scenario 4: Server dont know they are disconnected, so it there will be no update here, consequent 
    is when other people send them message they will not get the message properly 

*/

/*
    store username, change username, this database should be change to
    update username = update Session
    Scenario: change username, team send data 
    we need another part which is query status

    It will have the latest time of that connection, which is good for query
    Also in gateway API we check and terminate the connection if it not respond 
*/
const { Schema } = mongoose;
const connectionSchema = new mongoose.Schema({

    address: String,
    
}, { timestamps: true })

const Connection = mongoose.model('Connection', connectionSchema);

export default Connection;