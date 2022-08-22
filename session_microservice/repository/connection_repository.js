import Connection from "../model/connection"

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @async
 * @description This function is an API for session database to find all the connection of the user
 * @param {String} userId id of the user 
 * @returns {Array.<String>} this function will return an array of string contain the connection or an empty array 
*/
export const getConnection = async (userId) => {
    try{
        const connection = await Connection.find({userSession: userId}).select('address').exec();
        return connection;
    } catch (err) {
        console.log(err);
        return [];
    }   
}


/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description This function create a new Connection instance
 * @deprecated
 * @param {String} address this is the address of new websocket connection
 * @returns {Promise} this will return a Promise which resolve to new Connection
*/
const createNewConnection = (address) => {
    return Connection.create({address: address});
}

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description This function create a new Connection instance
 * @param {String} address this is the address of new websocket connection
 * @returns {Promise} this will return a Promise which resolve to new Connection
*/
const createConnection = (address, userId) => {
    return Connection.create({address: address, userSession: userId});
}
