require('dotenv').config()          //to get access of environment variable

const mongoose = require('mongoose')
const autoIncrement = require('mongoose-auto-increment')           //for creating auto incrementing field
const moment = require('moment')



// Initialize auto-increment
autoIncrement.initialize(mongoose)

const memberSchema = new mongoose.Schema({
    member_id: {
        type: Number,
        required: true, 
    },
    member_name: {
        type: String,  
        required: true,
        minLength: 3, 
        maxLength: 60,
    },
    email: {
        type: String,
        required: true,
        unique: true,
        match: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    },
    age: {
        type: Number,
        min: 0, 
        max: 120,
    },
    createdOn: {
        type: Number, // Store the epoch timestamp as a Number
        default: () => moment().unix()
    },
    updatedOn: {
        type: Number, // Store the epoch timestamp as a Number
        default: () => moment().unix()
    },
    state: { 
        type: Boolean,
        required: true,
        default: true,
    },
    country: {
        type: String,
        enum: ['USA','India','Australia','Japan', 'Canada', 'UK', 'Other'],
    },
})

// Convert epoch timestamp to Date when accessing the fields
memberSchema.virtual('createdOnDate').get(function () { return new Date(this.createdOn * 1000); });

memberSchema.virtual('updatedOnDate').get(function () { return new Date(this.updatedOn * 1000); });

memberSchema.plugin(autoIncrement.plugin, {      //creating a auto incrementing field
    model: 'schema', 
    field: 'member_id',
    startAt: 1, // Initial value
    incrementBy: 1 // Increment value
}) 


//Export mongoose schema
// const schema = new mongoose.model("users",modal)
const schema = mongoose.model('schema', memberSchema)
module.exports = schema


/***************************increment code by rishav************************/
// var CounterSchema = new mongoose.Schema({
//     forSchema: {type: String, required: true},
//     seq: { type: Number, default: 1 }
// });
// var counter = mongoose.model('counter', CounterSchema);



// memberSchema.pre('save', async function(next) {
//     var doc = this;
//     let memberCounter = await counter.findOne({ forSchema: 'member' });
//     if(!memberCounter) {
//         memberCounter = await counter.create({ forSchema: 'member' });
//     }
//     doc.member_id = memberCounter.seq;
//     await counter.findOneAndUpdate({forSchema: 'member'}, {$inc: { seq: 1 } });
// });
