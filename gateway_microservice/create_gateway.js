import http from "http";
import WebSocket, { WebSocketServer } from 'ws';
import { uuid } from 'uuidv4';
import pkg from 'query-string';
import { query } from "express";
const  querystring  = pkg;

var clientMetadata = new Map();
var userData = new Map();
const userMappingServiceURL = "localhost:8083/session";
const serviceAddress = "localhost:8081";
//in here we need to first exchange the chat room that the connection and then we would know what client should we send it too 
//this code need to improve, to test when the client is disconnect, we still need to handle lost 

export const createConnection = () => {
    try{
        //this will be reconfig when we run this as a microservice
        //this microservice will have two thing, first it create the connection and maintain the connection
        //second it will send the data to the session server for further process
        //so it will need the data and the information of the user
        //it will contain in three field: userId, topic, chat information
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

            //fetch(userMappingServiceURL,updateConnection);
            clientMetadata.set(id, {_request: request, _user: userId});
            //console.log(clientMetadata);
            addUserData(userId, id);

            request.on('message', (message) => {
                var data = JSON.parse(message.toString());

                const postData = { 
                    type: "data",
                    content: data.content
                }

                const messageUpload = {
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify(postData)
                }
                
                fetch(userMappingServiceURL, messageUpload);
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


