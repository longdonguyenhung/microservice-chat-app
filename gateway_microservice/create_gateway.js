import http from "http";
import WebSocket, { WebSocketServer } from "ws";
import { v4 } from "uuid";
import pkg from "query-string";
import { query } from "express";
import fetch from "node-fetch";
const querystring = pkg;

var clientMetadata = new Map();
var userData = new Map();
const userMappingServiceURL =
  process.env.SESSION_URL || "http://localhost:8083/";
const serviceAddress = process.env.URL;

/**
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description This function is not really a function it is an endpoint for the connection, it will be tested in integration testing
 */
export const createConnection = () => {
  try {
    var webserverConnection = new WebSocketServer({ port: 8082 });
    acceptWebsocketConnection(webserverConnection);
    pongMessengerConnection(webserverConnection);
    closeConnection(webserverConnection);
  } catch (error) {
    console.log(error);
  }
};

/**
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description establish a connection when receive a request from client. Send a request to update the connection in session service. This should be test on integration testing
 * @param {WebSocket.Server<WebSocket.WebSocket>} webserverConnection
 */
const acceptWebsocketConnection = (webserverConnection) => {
  webserverConnection.on("connection", (request, incomingRequest) => {
    console.log(incomingRequest.url);
    const id = v4();

    const userId = querystring.parse(incomingRequest.url.slice(1)).user;
    console.log(userId);
    console.log("ok");
    addClientMetadata(userId, id, request);
    addUserData(userId, id);

    const updateConnection = createUpdateSessionService(incomingRequest);
    fetch(userMappingServiceURL + "/session", updateConnection);

    request.on("message", (data) => {
      const messageUpload = sendMessageSessionService(data);
      fetch(
        userMappingServiceURL +
          "/message" +
          "?" +
          new URLSearchParams({ topicId: message.topicId }),
        messageUpload
      );
    });
  });
};

/**
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @description create a request to session service
 * @param {http.IncomingMessage} webserverConnection
 * @returns {<CustomType>}
 */
const createUpdateSessionService = (incomingRequest) => {
  const userId = querystring.parse(incomingRequest.url.slice(1)).user;
  const update = {
    user: userId,
    address: serviceAddress,
  };

  const updateConnection = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(update),
  };
  return updateConnection;
};

/**
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @description add an key value pair of id to request and userId
 * @function
 * @param {String} userId
 * @param {String} id
 * @param {WebSocket.WebSocket} request
 */
const addClientMetadata = (userId, id, request) => {
  clientMetadata.set(id, { _request: request, _user: userId });
};

/**
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @description create an request to session service when receive an message
 * @function
 * @param {WebSocket.RawData} data
 * @returns {<CustomType>}
 */
const sendMessageSessionService = (data) => {
  const message = JSON.parse(data);

  const postData = {
    type: "data",
    content: message.content,
  };

  const messageUpload = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(postData),
  };

  return messageUpload;
};

/**
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @description pong a answer a ping, to keep the connection alive
 * @function
 * @param {WebSocket.Server<WebSocket.WebSocket>} webserverConnection
 */
const pongMessengerConnection = (webserverConnection) => {
  webserverConnection.on("connection", function connection(ws) {
    ws.on("pong", () => (ws.isAlive = true));
  });
};

/**
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @description ping to a websocket connection, if the connection not answer after a period of time, terminate it
 * @function
 * @param {WebSocket.Server<WebSocket.WebSocket>} webserverConnection
 */
const closeConnection = (webserverConnection) => {
  const interval = setInterval(function ping() {
    webserverConnection.clients.forEach(function each(ws) {
      if (ws.isAlive === false) return ws.terminate();

      ws.isAlive = false;
      ws.ping();
    });
  }, 10000);

  webserverConnection.on("close", function close() {
    clearInterval(interval);
  });
};

/**
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @description
 * @function
 * @param {WebSocket.Server<WebSocket.WebSocket>} webserverConnection
 */
const addUserData = (userId, id) => {
  if (userData.has(userId)) {
    const connection = userData.get(userId);
    connection.push(id);
    userData.set(userId, connection);
  } else {
    const newConnection = [id];
    userData.set(userId, newConnection);
  }
};

/**
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @description delete the connection after the user go offline
 * @function
 * @param {WebSocket.Server<WebSocket.WebSocket>} webserverConnection
 */
const deleteId = (id) => {
  if (clientMetadata.has(id)) {
    const user = clientMetadata.get(id)._user;
    clientMetadata.delete(id);
    var data = userData.get(user);
    const index = data.indexOf(id);
    data.splice(index, 1);
    userData.set(userId, data);
  }
};

/**
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @description this is and endpoint, it receive the message from session microservice and send to the correspond connection, if a connection go off, it will delete that connection
 * @function
 */
export const receiveMessage = (req, res, next) => {
  for (let userId of req.body.user) {
    if (userData.has(userId)) {
      for (const connectionId of userData.get(userId)) {
        const connection = clientMetadata.get(connectionId)._request;
        if (connection.readyState === WebSocket.OPEN) {
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
};
