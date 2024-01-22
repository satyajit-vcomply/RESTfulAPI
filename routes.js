//request.params => These are properties attached to the url i.e named route parameters. You prefix the parameter name with a colon(:) when writing your routes.
//request.body => JSON data
//request.query => req.query is mostly used for searching,sorting, filtering, pagination, e.t.c, Say for instance you want to query an API but only want to get data from page 10, this is what you'd generally use [GET  http://localhost:3000/animals?page=10]. It written as key=value




const express = require('express')
const router = express.Router()                       //for making routes
const Member_schema = require('./schema')

//to get all members
router.get('/memberGet', async(req, res) => {
  try {
    const allMembers = await Member_schema.find()    //will store every member from Member_schema in allMembers

    if(!allMembers){
        res.status(404).send(`Member not found!!`)
    }

    res.status(200).json(allMembers)                 //return in member details in json with status 200
  } catch(error) {
    console.error(`Error: ${error}`);
    res.status(500).json({ error: error.message })
  }
})

//to get specific member
router.get('/memberGet/:id', async(req, res) => {
    try{

        const id = req.params.id                                       //getting id from the url
        const member = await Member_schema.find({'member_id': id})     //find by member_id
        //const member = await Member_schema.findById(id)                 //Error: CastError: Cast to ObjectId failed for value "2" (type string) at path "_id" for model "schema"
        
        if(!member){
            res.status(404).send(`Member not found!!`)
        }

        res.status(200).json(member)                                   //return the response with status 200

    } catch(error) {
        console.error(`Error: ${error}`);
        res.status(500).json({ error: error.message })
    }
})

//to create new member
router.post('/memberPost', async(req, res) =>{
    try{

        const { member_id, member_name, email, age } = req.body                                //destructure the request body
        const newMember = await Member_schema.create({ member_id, member_name, email, age })   //create entry as per defined schema
        res.status(201).json(newMember)                                                        //sending json along with status 200

    } catch(error) {
        console.error(`Error: ${error}`);
        res.status(500).json({ error: error.message })
    }
})

//to update by id
router.put('/memberPut/:id', async(req, res) => {
    try{

        const id = req.params.id                                       //getting id from the url
        //const member = await Member_schema.findOneAndUpdate(           //finding member by id and updating using $set
        const member = await Member_schema.updateOne(
            {'member_id': id},
            {$set: req.body},
            {new: true}
        ) 
        if(!member){
            res.status(404).send(`Member not found!!`)
        }
        res.status(201).json(member)

    } catch(error) {
        console.error(`Error: ${error}`);
        res.status(500).json({ error: error.message })
    }
})

//to delete by id
router.delete('/memberDelete/:id', async(req, res) => {
    try{
        const id = req.params.id   
        //const member = await Member_schema.findOneAndDelete(
        const member = await Member_schema.deleteOne(
            {'member_id': id}
        )
        if(!member){
            res.status(404).send(`Member not found!!`)
        }
        res.status(200)
    } catch(error) {
        console.error(`Error: ${error}`);
        res.status(500).json({ error: error.message })
    }
})



module.exports = router;