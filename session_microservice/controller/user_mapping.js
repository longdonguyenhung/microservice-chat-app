import Users from "../model/user.js";
import Session from "../model/session.js";
import fetch from "node-fetch";

const userMappingServiceURL = "localhost:8087/get_user";

export const userMapping = async (req, res, next) => {

    const update = {
        type: "update",
        topic: req.body.topic
    }

    const updateConnection = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(update)
    }

    fetch(userMappingServiceURL,updateConnection).then((users) => {
        users.forEach((user) => {
            const query = Session.findOne().select('connection').populate({
                path: 'member',
                match: {$eq: user},
            }).exec((err, document) => {
                if(err){
                    console.log(error)
                    return res.status(400).send(error);
                } 
                const data = {
                    topic: req.body.topic,
                    content: req.body.content
                }

                const sendingMessage = {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify(data)
                }

                console.log(document);

                //fetch(req.body.address, sendingMessage).then((respond) => console.log(respond));
            })
        });
    })
    return res.status(200).send("sending success");
}

export const updateConnection = async (req,res, next) => {
    const user = req.body.user;
    const addressId = req.body.address;
    const data = Session.findOne().populate({
        path: 'member',
        match: {$eq: user},
    }).exec((err, data) => {
        if(err)
            return res.status(200).send(err);
        else {
            console.log(data);
            if(data !== undefined){
                data.connection.push(addressId);
                data.save();
                return res.status(400);
            } else {
                const newUser = Users.create({username: user}).then(() => {
                    const session = Session.create({connection: [addressId], member: newUser});
                }).then( () => {
                    console.log(newUser);
                    console.log(session);
                    return res.status(400);
                })
                
            }
        }
    });   

    
}
