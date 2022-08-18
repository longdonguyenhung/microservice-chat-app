import http from "http";
import WebSocket, { WebSocketServer } from 'ws';
import { uuid } from 'uuidv4';
import pkg from 'query-string';
import { query } from "express";
import fetch from "node-fetch";
const  querystring  = pkg;

var clientMetadata = new Map();
var userData = new Map();
const userMappingServiceURL = process.env.SESSION_URL ;
const serviceAddress = process.env.URL;

/*
    Author: Long Do Nguyen Hung
    Created: 18/8/2022
    Function: createConnection
    Parameter: None
    Description: This function create a websocket connection to the client and send infomation about the connection to session service
    Included Function: addUserData, deleteId
    Step: 
        - First it initiated a websocket endpoint 
        - Then the user will create an HTTP request to this endpoint for conenction with information of userID
        - The connection is store in the hashmap using an userId as key 
        - Then this function will create an HTTP request to session service to update the information 
        - This function will listen when user send an message to forward to session message
        - It also ping the connection and delete if it not alive
*/
export const createConnection = () => {
    try{
        
        var webserverConnection = new WebSocketServer({port: 8082});
        webserverConnection.on('connection', (request, incomingRequest) => {
            const id = uuid();
            const userId = querystring.parse(incomingRequest.url.slice(1)).user;
            const update = {
                type: "update",
                user: userId,
                address: serviceAddress
            }

            const updateConnection = {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify(update)
            }

            fetch(userMappingServiceURL + "/session",updateConnection);
            clientMetadata.set(id, {_request: request, _user: userId});
            //console.log(clientMetadata);
            addUserData(userId, id);

            request.on('message', (data) => {
                const message = JSON.parse(data);
                
                const postData = { 
                    type: "data",
                    content: message.content
                }

                const messageUpload = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(postData)
                }
                
                fetch(userMappingServiceURL+ "/message" + "?" + new URLSearchParams({topicId: message.topicId}), messageUpload);
            });
        });

    webserverConnection.on('connection', function connection(ws) {
        ws.on('pong', () => ws.isAlive=true);
        });
        
    const interval = setInterval(function ping() {
    webserverConnection.clients.forEach(function each(ws) {
        if (ws.isAlive === false) return ws.terminate();
    
        ws.isAlive = false;
        ws.ping();
    });
    }, 10000);
        
    webserverConnection.on('close', function close() {
        clearInterval(interval);
    });

    } catch(error) {
        console.log(error);
    }
}

/*
    Author: Long Do Nguyen Hung
    Created: 18/8/2022
    Function: addUserData
    Parameter: userId: String, id: String
    Description: This function store the connection of the client to the hashmap
    Included Function: None
    Step: 
        - Get the id of the connection and store in a hashmap with key as userId
*/
const addUserData = (userId, id) => {
    if(userData.has(userId)){
        const connection = userData.get(userId);
        connection.push(id);
        userData.set(userId, connection);
    } else {
        const newConnection = [id];
        userData.set(userId, newConnection);
    }
}

/*
    Author: Long Do Nguyen Hung
    Created: 18/8/2022
    Function: addUserData
    Parameter: id: String
    Description: This function store the connection of the client to the hashmap
    Included Function: None
    Step: 
        - Find the connection in userId and delete using id 
*/
const deleteId = (id) => {
    if(clientMetadata.has(id)){
        const user = clientMetadata.get(id)._user;
        clientMetadata.delete(id);
        var data = userData.get(user)
        const index = data.indexOf(id);
        data.splice(index,1);
        userData.set(userId, data);
    }
}

/*
    Author: Long Do Nguyen Hung
    Created: 18/8/2022
    Function: receiveMessage
    Parameter: None
    Description: When receive the message from session service it transfer the data to correspond client
    Included Function: 
    Step: 
        - First it find the connection using the userId 
        - It send the message through the websocket
        - It also delete the connection if the connection is not alive anymore
*/
export const receiveMessage = (req, res, next) => {
    //console.log(req.body.user);
    for (let userId of req.body.user) {
        //console.log(userData);
        if(userData.has(userId)){
            for (const connectionId of userData.get(userId)){
                const connection = clientMetadata.get(connectionId)._request;
                if (connection.readyState === WebSocket.OPEN){
                    connection.send(req.body.content, { binary: true }, (error) => {
                        console.log(error);
                    });
                } else {
                    deleteId(connectionId);
                    continue;
                }
            }
        } else {
            console.log(userId); //so the connection must be sustain in another service
        }
    }
    return res.status(200).send("message success");
}


