import { request } from "express";

/**
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description create a body of request to send to the gateway_microservice
 * @param {Session} document Session Mongoose model
 * @param {CustomType} request incoming request
 */
const sendingDataWebsocket = (document, request) => {
  document.connection.forEach((connection) => {
    const sendingMessage = messageToWebsocket(
      request.query.topic,
      request.body.content,
      document.member.username
    );
    fetch(
      "http://" + "websocket-gateway:8081" + "/get_user",
      sendingMessage
    ).then(
      (respond) => {},
      (err) => {}
    );
  });
};

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
    user: [userId],
  };

  const sendingMessage = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(sendingData),
  };
  return sendingMessage;
};

/**
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description create a body of request to send to the gateway_microservice
 * @param {String} baseURL endpoint which we send request to
 * @param {Array.<{name: String, content: String}>} requests compound type that contain the request in the query
 * @return {String} query string
 */
export const createRequestQuery = (baseURL, requests) => {
  let urlRequest = baseURL + "?";
  requests.forEach((request) => {
    requestName = request.name;
    requestContent = request.content;
    urlRequest += new URLSearchParams({ requestName: requestContent });
  });
  return urlRequest;
};

export { sendingDataWebsocket };
