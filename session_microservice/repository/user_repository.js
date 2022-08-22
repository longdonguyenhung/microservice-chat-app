import UserSession from "../model/user";

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @async
 * @description This function is an API for session database to find the id of the UserSession
 * @param {String} username username of the user
 * @returns {Promise.<UserSession>} this function will return an Promise which resolve to a usersession
*/
export const findUserIdByUsername = (username) => {
        return UserSession.findOne({username: username}).exec();
}

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description This function create a new User instance
 * @param {String} username unique userId use as a username in UserSession instance
 * @returns {Promise} this will return a Promise which resolve to new UserSession
*/
const createUser = (username) => {
    return UserSession.create({username: username})
}

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description This function find user
 * @deprecated
 * @param {String} address this is the address of new websocket connection
 * @returns {Promise} this will return a Promise which resolve to a user or null
*/
const findUser = (user) => {
    return Users.findOne({username: user}).exec()
}

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description This function create a new User instance
 * @deprecated
 * @param {String} user unique userId use as a username in UserSession instance
 * @returns {Promise} this will return a Promise which resolve to new UserSession
*/
const createNewUser = (user) => {
    return Users.create({username: user})
}