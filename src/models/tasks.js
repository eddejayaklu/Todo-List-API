const mongoose = require("mongoose");

const taskSchema = new mongoose.Schema({
    description: {
        type: String,
        required: true,
        trim: true
    },
    completed: {
        type: Boolean,
        default: false
    },
    deadLineDate: {
        type: String,   //dd/mm/yyyy 
        required: true
    },
    deadLineTime: {
        type:String,   //hh:mm 
        required: true
    }

},{
    timestamps:true
})


const Task = mongoose.model('Task',taskSchema)

module.exports=Task