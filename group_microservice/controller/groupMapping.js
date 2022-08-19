import Group from "../model/group.js";
import Users from "../model/user.js";
import { EventEmitter } from 'node:events';
import isUserIdExist from "../middleware/userValidation.js";


/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description This is an endpoint, it return all the member in the topic 
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

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description create a group, if a user is not existed, it create a user and add to a group, this function is for developing, not tested
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

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description This is an endpoint, it find a group chat and add user to it 
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

/** 
 * @author Long Do Nguyen Hung <hunglong6a1@gmail.com>
 * @function
 * @description This is an endpoint, it create new group
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
