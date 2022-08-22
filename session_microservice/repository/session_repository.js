
/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description This function create a new Session instance
 * @deprecated
 * @param {String} user unique userId use as a username in UserSession instance
 * @param {String} connectionId the id of the new created connection
 * @returns {Promise} this will return a Promise which resolve to new Session
*/
const createNewSession = (userId, connectionId) => {
    return Session.create({connection: [connectionId], member: user});
}

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @async
 * @deprecated
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
 * @deprecated
 * @description This function update a new connection
 * @param {String} userId id of the SessionUser
 * @param {String} connectionId id 
 * @returns {Session} it will return a Session instance 
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