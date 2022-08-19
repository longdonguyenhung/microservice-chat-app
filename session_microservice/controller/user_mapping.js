import Users from "../model/user.js";
import Session from "../model/session.js";
import fetch from "node-fetch";
import Connection from "../model/connection.js";

const userMappingServiceURL = process.env.GROUP_URL;

/*
    Author: Long Do Nguyen Hung
    Created: 18/8/2022
    Function: userMapping
    Parameter: None
    Description: It send the message to the correspond gateway
    Included Function: None
    Step: 
        - First it send the topicId to the group service. Group service will send back the userId to the session service.
        - Then it will search the userId to find the correspond connection of the socket gateway
        - It create a HTTP request to the websocket gateway with the content
*/
export const userMapping = async (req, res, next) => {

    console.log(req.query.topicId);
    
    fetch(userMappingServiceURL + "/group" + "?" + new URLSearchParams({topicId: req.query.topicId})).then((response) => {
        response.json().then((data) => {
            data.member.forEach(async (user) => {
                const userId = await Users.find({username: user._id}).exec();
                console.log(user._id);
                console.log(userId);
                const query = Session.findOne({member: userId}).populate('member connection').exec((err, document) => {
                    if(err){
                        console.log(error)
                        return res.status(400).send(error);
                    } 

                    if(document && document.member){
                        document.connection.forEach((connection) => {
                            const sendingData = {
                                topic: req.query.topic,
                                content: req.body.content,
                                user: [document.member.username]
                            }
                            
                            const sendingMessage = {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify(sendingData)
                            }

                            fetch("http://" + "websocket-gateway:8081" + "/get_user", sendingMessage).then((respond) => {}, (err) => {});
                        })}
            });
        })
        return res.status(200).send("success");
    })
})
}


/*
    Author: Long Do Nguyen Hung
    Created: 18/8/2022
    Function: updateConnection
    Parameter: None
    Description: It update the connection of the user to the correspond websocket gateway
    Included Function: None
    Step: 
        - First It create new Connection instance
        - Then it find if the userId in the UserSession exist, if the user is not existed, it create the new UserSession, Session instance, store in the database
        - If the User and the Session instance exist, it will update the Session instance with the new Connection
*/
export const updateConnection = async (req,res, next) => {
    const user = req.body.user;
    const addressId = req.body.address;
    const userId = await Users.findOne({username: user}).exec();
    const connection = await Connection.create({address: addressId});
    const connectionId = connection._id;
    if(!userId){
        Users.create({username: user}).then(async (user) => {
            Session.create({connection: [connectionId], member: user}).then((session) => {
                return res.status(200).json(session);
            })
        })
    } else {
        Session.findOne({member:userId} ).populate('member').exec((err, data) => {
            if(err)
                return res.status(200).send(err);
            else {
                if(data !== null){
                    Session.updateOne({_id:data._id}, { $push: {connection: connectionId}});
                    return res.status(400).json(data);
                } else {
                    Session.create({member:userId, connection: [connectionId]}).then((err,data) =>{
                        if(err)
                            console.log(err)
                        return res.status(400).json(data);});
                }
            }
        });   
    }
}
