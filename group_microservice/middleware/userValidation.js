import Users from "../model/user.js"

const isUserIdExist = async (userId) => {
    const userExist = await Users.exists({_id:userId});
    return userExist;
}

export default isUserIdExist;