//const Member_schema = require('../schema')
const { Member_schema } = require('./table-schema')


const controller = async (mode, params) => {
    let member
    switch(mode){
        case 'list': 
            const { query, skip, showLimit, finalSort, order } = params
            member = await Member_schema.find(query)
            .skip(skip)
            .limit(showLimit)
            .sort({[finalSort]: order});
            return member

        case 'insert': 
            const { member_name, email, age, createdOn, updatedOn, state, country } = params
            member = await Member_schema.create({ member_name, email, age, createdOn, updatedOn, state, country })
            return member

        case 'update': 
        const { id, reqBody } = params
            member = await Member_schema.updateOne(
                {'member_id': id},
                {$set: reqBody},
                {new: true}
            ) 
        return member

        case 'delete':
            const { query1, flag } = params
            if(flag) {member = await Member_schema.deleteOne(query1)}
            else if(!flag) {member = await Member_schema.deleteMany(query1)}
            return member

        default: 
            throw new Error('Invalid mode specified');
    }
}

module.exports = { controller }

// const insertQuery = async (member_name, email, age, createdOn, updatedOn, state, country) => {
//     const newMember = await Member_schema.create({ member_name, email, age, createdOn, updatedOn, state, country })
//     return newMember
// }

// const updateQuery = async (id, reqBody) => {
//     const member = await Member_schema.updateOne(
//         {'member_id': id},
//         {$set: reqBody},
//         {new: true}
//     ) 
//     return member
// }

// const deleteQuery = async (query, flag) => {
//     let member 
//     if(flag) {member = await Member_schema.deleteOne(query)}
//     else if(!flag) {member = await Member_schema.deleteMany(query)}
//     return member
// }

// const listQuery = async (query, skip, showLimit, finalSort, order) => {
//     const members = await Member_schema.find(query)
//             .skip(skip)
//             .limit(showLimit)
//             .sort({[finalSort]: order});
//     return members
// }

//module.exports = { listQuery, insertQuery, updateQuery, deleteQuery, controller }
