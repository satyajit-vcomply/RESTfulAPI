//request.params => These are properties attached to the url i.e named route parameters. You prefix the parameter name with a colon(:) when writing your routes.
//request.body => JSON data
//request.query => req.query is mostly used for searching,sorting, filtering, pagination, e.t.c, Say for instance you want to query an API but only want to get data from page 10, this is what you'd generally use [GET  http://localhost:3000/animals?page=10]. It written as key=value

const express = require('express')

const router = express.Router()                       //for making routes
const Member_schema = require('./schema')
const moment = require('moment')
//const { listQuery, insertQuery, updateQuery, deleteQuery, controller } = require('./db-service/db_queries')
const { controller } = require('./db-service/db_queries')

/*****************Get*****************/

// router.get('/test', async(req,res) => {
//     try{
//         const result = await Member_schema.find({age: {$in: [38, 25, 35]}}, {age: 1, _id:0}).lean()
//         console.log(`complete result ${JSON.stringify(result)}`);
//         const ageArray = result.map((obj) => obj.age);
//         console.log(`array result:: ${ageArray}`)
//         return res.status(200).send('done!!')

//     }catch(error) {
//         console.log(`Server Error: ${error}`);
//     }
// })

//to get all members (Added: search by name, sort by any field)
router.get('/memberGet', async (req, res) => {
    try {
        const { name, sort, sortBy, page, limit } = req.query; // Destructuring the request query
        const Total_entries = await Member_schema.countDocuments();

        let showPage = Number(page) || 1;
        let showLimit = Number(limit) || 3;
        let skip = (showPage - 1) * showLimit;

        /** Validating the request query keys before doing operations **/
        // Validating for end of data
        if (skip > Total_entries) {return res.status(400).send(`No data here (try to decrease the page value)`);}
        // Validate page and limit
        if (isNaN(showPage) || showPage < 1) {return res.status(400).send(`Invalid page value!! (valid: >1)`);}
        // Limit validation:
        if (isNaN(showLimit) || showLimit < 1 || showLimit > 30) {return res.status(400).send(`Invalid limit value!! (1<=valid<=30)`);}
        // SortBy validation: 
        // Sort field validation:
        if (sort) {
            const validSortFields = ['member_id', 'member_name', 'email', 'age', 'createdOn', 'updatedOn', 'state', 'country'];
            if (!validSortFields.includes(sort)) {return res.status(400).send(`Invalid sort field!!`);}
        }
        // Name validation
        if (name) {
            if (typeof name !== 'string' || name.length < 3 || name.length > 60) {return res.status(400).send(`Invalid name field!!`);}
        }
        /** Request query validation ends **/

        let finalSort = sort ? sort : 'member_id'; // Default sorting field
        let order = 1;                             // Default sorting order
        if(sortBy && sortBy.toLowerCase()==="desc"){ order = -1 }

        // Query object to pass in find
        const query = {};
        if (name) {query.member_name = name;}

        //const members = await listQuery(query, skip, showLimit, finalSort, order)
        const params = {
            query: query,
            skip: skip,
            showLimit: showLimit,
            finalSort: finalSort,
            order: order
        }
        const members = await controller('list', params)

        if (members.length === 0) {
            return res.status(404).send(`Member not found!!`);
        }

        const membersWithFormattedDates = members.map(member => {
            return {
                ...member.toJSON(),
                createdOnDate: member.createdOnDate,
                updatedOnDate: member.updatedOnDate,
            }})   
        return res.status(200).json(membersWithFormattedDates)        //return the json response with status 200
        //return res.status(200).json(members);
    } catch (error) {
        console.error(`Error: ${error}`);
        return res.status(500).json({ error: error.message });
    }
})

//to get specific member
router.get('/memberGet/:id', async(req, res) => {
    try{
        const id = req.params.id                                       //getting id from the url
        const query = {'member_id': id}
        //const member = await listQuery(query)                          //db call using db-services
        const params = {
            query: query
        }
        const member = await controller('list', params)
        
        if(Object.keys(member).length===0){
            return res.status(404).send(`Member not found!!`)
        }

        const membersWithFormattedDates = member.map(member => {
            return {
                ...member.toJSON(),
                createdOnDate: member.createdOnDate,
                updatedOnDate: member.updatedOnDate,
            }})   
        return res.status(200).json(membersWithFormattedDates)          //return the json response with status 200

    } catch(error) {
        console.error(`Error: ${error}`);
        return res.status(500).json({ error: error.message })
    }
})

/*****************Create*****************/

//to create new member
router.post('/memberPost', async(req, res) =>{
    try{
        let { member_name, email, age, createdOn, updatedOn, state, country  } = req.body                                //destructure the request body

        const currentTimestamp = moment().unix()
        if(!createdOn && !updatedOn) {
            createdOn = currentTimestamp
            updatedOn = currentTimestamp
        }

        /**Validating the request body before inserting into database**/
        //member_name validation:
        if (typeof member_name !== 'string' || !member_name || member_name.length < 3 || member_name.length > 60) {
            return res.status(400).send('Member name must be between 3 and 50 characters!!');
        }
        //email validation:
        if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            return res.status(400).send('Invalid email format!!');
        }
        //age validation:
        if (!age || (age !== undefined && (isNaN(age) || age < 0 || age > 120))) {
            return res.status(400).send('Invalid age!! Valid age [0<age<120]');
        }
        //created and updated date validation:
        if (!createdOn || !updatedOn || isNaN(createdOn) || isNaN(updatedOn)) {
            return res.status(400).send('Invalid timestamps!! Should be in epoch format');
        }
        //state validation:
        state = state === undefined ? true : state
        if (typeof state !== 'boolean') {
            return res.status(400).send('Invalid state value!! Valid state [true, false]');
        }
        //country validation
        if (country==null || !country || country === '' || (country && !['USA','India','Australia','Japan', 'Canada', 'UK', 'Other'].includes(country))) {
            return res.status(400).send(`Invalid country!! Valid countries list ['USA','India','Australia','Japan', 'Canada', 'UK', 'Other']`);
        }
        /**Request body validation ends**/

        //const newMember = await Member_schema.create({ member_name, email, age, createdOn, updatedOn, state, country })   //create entry as per defined schema
        //const newMember = await insertQuery(member_name, email, age, createdOn, updatedOn, state, country)

        const params = {
            member_name: member_name, 
            email: email, 
            age: age,
            createdOn: createdOn,
            updatedOn: updatedOn,
            state: state, 
            country: country
        }
        const newMember = await controller('insert', params)
        return res.status(201).json(newMember)                //sending json along with status 200

    } catch(error) {
        console.error(`Error: ${error}`);
        return res.status(500).json({ error: error.message })
    }
})

//to bulk create
router.post('/memberBulkPost', async(req, res) =>{
    try{

        // const members = req.body                                    
        // const newMembers = await Member_schema.insertMany(members)                              //bulk insert using insertMany
        // res.status(201).json(newMembers)                                                        //sending json along with status 200

        const members = req.body;
        if(req.body.length>20) {
            return res.status(400).send(`bulk post limit(20) exceeded!!`)
        }

        const newMembers = [];

        for (const memberData of members) {
          //traversing each entry of req body
            let {
                member_name,
                email,
                age,
                createdOn,
                updatedOn,
                state,
                country,
            } = memberData; 

            const currentTimestamp = moment().unix()
            if(!createdOn && !updatedOn) {
                createdOn = currentTimestamp
                updatedOn = currentTimestamp
            }

            /**Validating the request body before inserting into database**/
            //member_name validation:
            if (typeof member_name !== "string" || !member_name || member_name.length < 3 || member_name.length > 60) {
                return res.status(400).send("Member name must be between 3 and 50 characters!!");
            }
            //email validation:
            if (!email || !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
                return res.status(400).send("Invalid email format!!");
            }
            //age validation:
            if (!age || (age !== undefined && (isNaN(age) || age < 0 || age > 120))) {
                return res.status(400).send("Invalid age!! Valid age [0<age<120]");
            }
            //created and updated date validation:
            if (!createdOn || !updatedOn || isNaN(createdOn) || isNaN(updatedOn)
            ) {
                return res
                .status(400)
                .send("Invalid timestamps!! Should be in epoch format");
            }
            //state validation:
            state = state === undefined ? true : state;
            if (typeof state !== "boolean") {
                return res.status(400).send("Invalid state value!! Valid state [true, false]");
            }
            //country validation
            if (
                country == null ||
                !country ||
                country === "" ||
                (country &&
                ![
                    "USA",
                    "India",
                    "Australia",
                    "Japan",
                    "Canada",
                    "UK",
                    "Other",
                ].includes(country))
            ) {
                return res
                .status(400)
                .send(
                    `Invalid country!! Valid countries list ['USA','India','Australia','Japan', 'Canada', 'UK', 'Other']`
                );
            }
            /**Request body validation ends**/

            // const newMember = await Member_schema.create({});
            //const newMember = await insertQuery(member_name, email, age, createdOn, updatedOn, state, country)
            const params = {
                member_name: member_name, 
                email: email, 
                age: age,
                createdOn: createdOn,
                updatedOn: updatedOn,
                state: state, 
                country: country
            }
            const newMember = await controller('insert', params)

            newMembers.push(newMember);
            }

        return res.status(201).json(newMembers);

    } catch(error) {
        console.error(`Error: ${error}`);
        return res.status(500).json({ error: error.message })
    }
})

/*****************Update*****************/

//to update by id
router.put('/memberPut/:id', async(req, res) => {
    try{

        const id = req.params.id                        

        /**Validating the request body before inserting into database**/
        let { member_name, email, age, createdOn, updatedOn, state, country } = req.body;
        const errors = [];                         //to store error

        //member_name validation:
        if ( member_name && (typeof member_name !== 'string' || member_name.length < 3 || member_name.length > 60)) {
            errors.push('Member name must be between 3 and 50 characters.');
        }
        //email validation:
        if (email && !email.match(/^[^\s@]+@[^\s@]+\.[^\s@]+$/)) {
            errors.push('Invalid email format.');
        }
        
        //age validation:
        if (age && (age !== undefined && (isNaN(age) || age < 0 || age > 120))) {
            errors.push('Invalid age.');
        }
        //createdOn validation:
        if (createdOn && isNaN(createdOn)) {
            errors.push('Invalid createdOn timestamp.');
        }
        //updatedOn validation:
        if (updatedOn && isNaN(updatedOn)) {
            errors.push('Invalid updatedOn timestamp.');
        }
        //state validation:
        if (state && typeof state !== 'boolean') {
            errors.push('Invalid state value.');
        }
        //country validation:
        if (country && (country==null || country === '' || (country && !['USA','India','Australia','Japan', 'Canada', 'UK', 'Other'].includes(country)))) {
            errors.push('Invalid country.');
        }

        //return the array of errors with status 400
        if (errors.length > 0) {
            return res.status(400).json({ errors });
        }
        /**Request body validation ends**/

        //const member = await updateQuery(id, req.body)

        const currentTimestamp = moment().unix()
        const params = {
            id: id,
            //reqBody: req.body
            reqBody: {
                ...req.body,
                updatedOn: currentTimestamp, // Set updatedOn dynamically during update
            }
        }
        const member = await controller('update', params)

        if(member.matchedCount === 0){                                   //id validation
            return res.status(404).send(`Member not found!!`)
        }
        return res.status(201).json(member)

    } catch(error) {
        console.error(`Error: ${error}`);
        return res.status(500).json({ error: error.message })
    }
})


router.put('/memberStateChange/:id', async(req, res) => {
    try{
        const id = req.params.id                                                           //getting id from the url
        const { to } = req.query
        const state = await Member_schema.findOne({'member_id': id}, {state: 1, _id: 0})   //getting state of the targeted member
        //id validation:
        if(!state){return res.status(404).send(`Member not found!!`)}
        //to validation:
        if(to===undefined){return res.status(400).send(`Please specify the key(to) value`)}
        if(!(to==='activate' || to==='deactivate')) {return res.status(400).send(`Invalid key(to) value!!`)}

        const currentTimestamp = moment().unix()

        if(to==='activate') {
            if(state.state===false){      
                const params = {
                    id: id,
                    reqBody: {
                        state: true,
                        updatedOn: currentTimestamp, // Set updatedOn dynamically during update
                    }
                }   
                //const member = await updateQuery(id, {state: true, updatedOn: currentTimestamp})
                const member = await controller('update', params)
                return res.status(201).send(`activated member with id:${id}`)
            }else {
                return res.status(201).send(`member already activated!!`)
            }
        } else if(to==='deactivate') {
            if(state.state===true){
                const params = {
                    id: id,
                    reqBody: {
                        state: false,
                        updatedOn: currentTimestamp, // Set updatedOn dynamically during update
                    }
                }   
                //const member = await updateQuery(id, {state: false, updatedOn: currentTimestamp})
                const member = await controller('update', params)
                return res.status(201).send(`deactivated member with id:${id}`)
            }else {
                return res.status(201).send(`member already deactivated!!`)
            }
        }
    } catch(error){
        console.error(`Error: ${error}`);
        return res.status(500).json({ error: error.message })
    }
})

/*****************Delete*****************/

//to delete by id
router.delete('/memberDelete/:id', async(req, res) => {
    try{
        const id = req.params.id                                             
        //const member = await Member_schema.deleteOne({'member_id': id})
        //const member = await deleteQuery({'member_id': id}, 1)
        const params = {
            query: {'member_id': id},
            flag: 1
        }
        const member = await controller('delete', params)

        if(member.deletedCount===0){
            return res.status(404).send(`Member not found!!`)
        }
        return res.status(200).send(`Member with id:${id} deleted`)
    } catch(error) {
        console.error(`Error: ${error}`);
        return res.status(500).json({ error: error.message })
    }
})

//to delete all members
router.delete('/memberAllDelete', async(req, res) => {
    try{
        //const deleteMembers = await Member_schema.deleteMany({})    
        //const deleteMembers = await deleteQuery({}, 0)     
        const params = {
            query: {},
            flag: 0
        }
        const deleteMembers = await controller('delete', params)   
                
        if(!deleteMembers){
            return res.status(404).send(`Member not found!!`)
        }
        res.status(200).send(`All members deleted!!`)
    } catch(error) {
        console.error(`Error: ${error}`);
        return res.status(500).json({ error: error.message })
    }
})

module.exports = router;