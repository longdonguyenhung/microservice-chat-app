import Group from "../model/group.js";
import Users from "../model/user.js";
import { EventEmitter } from 'node:events';

export const groupMapping = async (req, res, next) => {
    const topic = req.query.topic;
    console.log(topic);
    Group.findOne({topic: topic}).select('member').populate('member').exec((err, document) => {
        if(err){
            console.log(err);
        }

        if(!document) {
            return res.status(500).send(err)
        }
        console.log(res);
        return res.status(200).json(document);
    });
}

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