import Users from "../model/user.js";
import Session from "../model/session.js";
import fetch from "node-fetch";
import Connection from "../model/connection.js";
import { Session } from "express-session";
import { connection } from "mongoose";
import {createUser} from '../repository/user_repository.js';
import {createConnection} from '../repository/connection_repository.js';
import {findUserIdByUsername} from '../repository/user_repository.js';
import {sendingDataWebsocket, createRequestQuery} from '../Util/create_request.js';

const userMappingServiceURL = process.env.GROUP_URL;

/**
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description This is an endpoint, when it receive the userId from group_service it send the message to correspond websocket gateway
 */
export const userMapping = async (req, res, next) => {
    //request the data from group service
    
    fetch(createRequestQuery(userMappingServiceURL + "/group", [{topicId: req.query.topicId}])).then((response) => {
        response.json().then((data) => {
            data.member.forEach(async (user) => {
                const userId = await findUserIdByUsername(user);
                const connection = getConnection(userId);
                if(!(typeof connection !== 'undefined' && connection.length === 0)){
                    sendingDataWebsocket(connection, req);
                }
            });
        })
        return res.status(200).send("success");
    })
}


/**
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @async
 * @description This function update user connection.
 * @param {String} address this is an endpoint, it will be tested in integration testing
 * @returns {Promise} this will return a Promise which resolve to a user or null
*/
export const updateConnection = async (req,res, next) => {
    const username = req.body.user;
    const address = req.body.address;
    const user = await findUser(username);
    const userId = user._id;

    if(!userId){
        return createUser(user).then(async (user) => createConnection(address, userId))
                .then((connection) => {return res.status(200).json(connection)});
    } else {
        const connection = await createConnection(address, userId);
        return res.status(400).json(connection);
    }
}