import Users from "../model/user.js";
import Session from "../model/session.js";
import fetch from "node-fetch";

const userMappingServiceURL = "http://localhost:8084/group";

export const userMapping = async (req, res, next) => {

    const update = {
        type: "update",
        topic: req.query.topic
    }

    const updateConnection = {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
    }


    fetch(userMappingServiceURL + "?" + new URLSearchParams({topic: "new"}),updateConnection).then((response) => {
        response.json().then((data) => {
            
            data.member.forEach(async (user) => {
                const userId = await Users.find({username: user.username}).exec();
                console.log(userId.username);
                const query = Session.findOne({member: userId}).populate('member').exec((err, document) => {
                    if(err){
                        console.log(error)
                        return res.status(400).send(error);
                    } 
                    
                    //console.log(document);

                    if(document && document.member){
                        document.connection.forEach((connection) => {
                            const sendingData = {
                                topic: req.query.topic,
                                content: req.body.content,
                                user: [document.member.username]
                            }
            
                            const sendingMessage = {
                                method: "POST",
                                headers: {
                                  "Content-Type": "application/json",
                                },
                                body: JSON.stringify(sendingData)
                            }

                                                
                            console.log(sendingMessage);

                            fetch("http://" + connection + "/get_user", sendingMessage).then((respond) => {}, (err) => {});
                        })}
        });
            return res.status(200);
        })
    })
})
}


//this function is add new connection, however if the address is the same it must eliminate the old one and add the new connection
//when query it must query with time
export const updateConnection = async (req,res, next) => {
    const user = req.body.user;
    const addressId = req.body.address;
    const userId = await Users.findOne({username: user}).exec();
    if(!userId){
        Users.create({username: user}).then((user) => {
            Session.create({connection: [addressId], member: user}).then((session) => {
                return res.status(200).json(session);
            })
        })
    } else {
        Session.findOne({member:userId}, ).populate('member').exec((err, data) => {
            if(err)
                return res.status(200).send(err);
            else {
                if(data !== null){
                    data.connection.push(addressId);
                    data.save();
                    return res.status(400).json(data);
                } else {
                    Session.create({member:userId, connection: [addressId]}).then((err,data) =>{
                    return res.status(400).json(data);});
                }
            }
        });   
    }
}
