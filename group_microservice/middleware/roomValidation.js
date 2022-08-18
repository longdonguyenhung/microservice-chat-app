import Group from "../model/group.js";

export const isRoomExist = (req,res,next) => {
    const id = req.body.topicId;
    if(!id){
        return res.status(400).send("Bad request");
    }

    Group.find({_id: id}).exec((err, room) => {
        if(err)
            console.log(err);
        else {
            if(!room)
                return res.status(200).send("Room not exist");
        }
    })

    next();
}
