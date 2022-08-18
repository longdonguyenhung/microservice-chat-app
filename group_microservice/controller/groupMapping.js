import Group from "../model/group.js";
import Users from "../model/user.js";
import { EventEmitter } from 'node:events';
import isUserIdExist from "../middleware/userValidation.js";

/*
    Author: Long Do Nguyen Hung
    Created: 18/8/2022
    Function: groupMapping
    Parameter: None
    Description: return userID in the topic
    Included Function: 
    Step: 
        - First it find all the member or userId by the topic id
        - Send all the userId the the session service
*/
export const groupMapping = async (req, res, next) => {
    const topicId = req.query.topicId;
    Group.findOne({_id: topicId}).select('member').populate('member').exec((err, document) => {
        if(err){
            console.log(err);
        }

        if(!document) {
            return res.status(500).send(err)
        }
        return res.status(200).json(document);
    });
}

/*
    Author: Long Do Nguyen Hung
    Created: 18/8/2022
    Function: groupForming
    Parameter: None
    Description: Create a chat room using userId. This function is only use for development not production 
    Included Function: 
    Step: 
        - First it will find if the user is exist, if not it create the new user and store in the database
        - When all the user is created it emit and event to trigger the group creating, the trigger is the variable name 'counter'
*/
export const groupForming = async (req, res, next) => {
    const members = req.body.member;
    const topic = req.body.topic;
    const topicMembers = [];
    let counter = members.length;
    let emitter = new EventEmitter();
    let isAllMember = false;

    const body = {};

    const emitEvent = (counter,event) => {
        if(counter == 0)
            emitter.emit(event);
    }

    const groupInsert = (group) => {
        group.member = topicMembers;
        group.save();
        body['successTopic'] = group;
        return res.status(200).json(body);
    }

    const insertMember = (emitter, group) => {
        if(isAllMember == false){
            emitter.on('event', () => {
                return groupInsert(group);
            });
        } else {
            return groupInsert(group);
        }
    }

    emitter.on('event', () => isAllMember=true);

        
        body['failMember']= [];
        body['successMember'] = [];

        const insertNewMember = (user) => {
            topicMembers.push(user);
            let successMember = body['successMember'];
            successMember.push(user);
            body['successMember'] = successMember;
        }

        members.forEach(async member => {
            Users.findOne({username: member}).exec(async (err, document) => {
                if(err) {
                    console.log(err) //in production we should retry to create the new user
                }
                if(!document){
                    Users.create({username: member}).then((member) => {
                        insertNewMember(member)
                        counter-=1;
                        emitEvent(counter,'event');
                    }, (error) => console.log(error)); //in fact we should let retry to connect to the database
                } else {
                    insertNewMember(document);
                    counter-=1;
                    emitEvent(counter,'event');
                }
                
            })            
        })


        const group = Group.findOne({topic: topic}).exec((err) => {
            if(err){
                console.log(err); //in reality we must retry to create new one
                body.set(failTopic, topic);
            }
        })

        if(!group) {
            Group.create({topic: topic, member: []}).then((group) => {
                return insertMember(emitter, group);
            });
        } else {
            return insertMember(emitter,group);
        }
}

/*
    Author: Long Do Nguyen Hung
    Created: 18/8/2022
    Function: addUserToChat
    Parameter: None
    Description: It find the correspond chat using userId and add the user to the group
    Included Function: 
    Step: 
        - First it find the group using the groupId, the groupId
        - It then push a new userId into the member of the group
*/
export const addUserToChat = (req,res,next) => {
    const userId = req.body.userId;
    const topicId = req.body.topicId;
    Group.findById({_id:topicId}).exec((err, group) => {
        if(err)
            console.log(err);
        else {
            Users.findById({_id: userId}).exec((err,user) => {
                if(err)
                    console.log(err);
                group.member.push(user);
                group.save();
                return res.status(200).send("adding success");
                //in reality we must route this to the notification service to the person who is added to
            })
        }
    })
}

/*
    Author: Long Do Nguyen Hung
    Created: 18/8/2022
    Function: createGroup
    Parameter: None
    Description: It create a new chat group with userId as an array
    Included Function: 
    Step: 
        - First it find all the user, if the user have role "owner", it wil be store in the variable with the same name
        - Then it store in the correspond field
*/
export const createGroup = async (req,res,next) => {
    //so we need to send the id of the user 
    const addUser = req.body.member; 
    let userExist = []
    let owner;
    addUser.forEach((user) => {
        const userId = user.userId;
        if(isUserIdExist(userId)){
            if(user.role === "owner")
                owner = userId;
            else 
                userExist.push(userId);
        }
    })
    console.log(req.body.topic);
    let group =  await Group.create({owner: owner, member:[userExist], title:req.body.topic});
    return res.status(200).json(group);
}
