import Users from "../model/user.js";
import Session from "../model/session.js";
import fetch from "node-fetch";
import Connection from "../model/connection.js";
import { Session } from "express-session";
import { connection } from "mongoose";

const userMappingServiceURL = process.env.GROUP_URL;

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description This is an endpoint, when it receive the userId from group_service it send the message to correspond websocket gateway
*/
export const userMapping = async (req, res, next) => {
    //request the data from group service
    fetch(userMappingServiceURL + "/group" + "?" + new URLSearchParams({topicId: req.query.topicId})).then((response) => {
        response.json().then((data) => {
            data.member.forEach(async (user) => {

                const userId = await Users.find({username: user._id}).exec(); //in UserSession model, the username is the userId in User model

                //Find the member who own the connections
                Session.findOne({member: userId}).populate('member connection').exec((err, document) => {
                    if(err){
                        console.log(error)
                        return res.status(400).send(error);
                    } 

                    if(document && document.member){
                        sendingDataWebsocket(document,req);
                    }
            });
        })
        return res.status(200).send("success");
    })
})
}

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description create a body of request to send to the gateway_microservice
 * @param {Session} document Session Mongoose model
 * @param {CustomType} request incoming request
*/
const sendingDataWebsocket = (document,request) => {
    document.connection.forEach((connection) => {
        const sendingMessage = messageToWebsocket(req.query.topic, req.body.content, document.member.username);
        fetch("http://" + "websocket-gateway:8081" + "/get_user", sendingMessage).then((respond) => {}, (err) => {});
    })
}

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description create a body of request to send to the gateway_microservice
 * @param {String} topicId id of the topic
 * @param {String} content message send to the gateway_microservice
 * @param {String} userId id of user who receive message
*/
const messageToWebsocket = (topicId, content, userId) => {
    const sendingData = {
        topic: topicId,
        content: content,
        user: [userId]
    }
    
    const sendingMessage = {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(sendingData)
    }
    return sendingMessage;
};

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @async
 * @description This function update user connection. 
 * @param {String} address this is an endpoint, it will be tested in integration testing
 * @return {Promise} this will return a Promise which resolve to a user or null
*/
export const updateConnection = async (req,res, next) => {
    const username = req.body.user;
    const address = req.body.address;

    const connection = await createNewConnection(address);
    const user = await findUser(username);

    const connectionId = connection._id;
    const userId = user._id;
    if(!userId){
        return createNewUser(user).then(async (user) => createNewSession(userId, connectionId))
                .then((session) => {return res.status(200).json(session)});
    } else {
        const data = updateSessionConnection(userId, connectionId);
        return res.status(400).json(data);
    }
    
}

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description This function find user
 * @param {String} address this is the address of new websocket connection
 * @return {Promise} this will return a Promise which resolve to a user or null
*/
const findUser = (user) => {
    return Users.findOne({username: user}).exec()
}

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description This function create a new Connection instance
 * @param {String} address this is the address of new websocket connection
 * @return {Promise} this will return a Promise which resolve to new Connection
*/
const createNewConnection = (address) => {
    return Connection.create({address: address});
}

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description This function create a new User instance
 * @param {String} user unique userId use as a username in UserSession instance
 * @return {Promise} this will return a Promise which resolve to new UserSession
*/
const createNewUser = (user) => {
    return Users.create({username: user})
}

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description This function create a new Session instance
 * @param {String} user unique userId use as a username in UserSession instance
 * @param {String} connectionId the id of the new created connection
 * @return {Promise} this will return a Promise which resolve to new Session
*/
const createNewSession = (userId, connectionId) => {
    return Session.create({connection: [connectionId], member: user});
}

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @async
 * @description This function create a new User instance and new Session instance
 * @param {String} id id of the Session instance
 * @param {String} connectionId the id of the new created connection
*/
const updateConnectionWhenSessionNotExist = (id, connectionId) => {
    Session.updateOne({_id:id}, { $push: {connection: connectionId}});
}

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @async
 * @description This function update a new connection
 * @param {String} userId id of the SessionUser
 * @param {String} connectionId id 
 * @return {Session} it will return a Session instance 
*/
const updateSessionConnection = (userId, connectionId) => {
    Session.findOne({member:userId} ).populate('member').exec((err, data) => {
        if(err)
            console.log(err);
        else {
            if(data !== null){
                updateConnectionWhenSessionNotExist(data._id, connectionId);
                return data;
            } else {
                const newSession = await createNewSession(userId, connectionId);
                return newSession;
            }
        }
    }); 
}