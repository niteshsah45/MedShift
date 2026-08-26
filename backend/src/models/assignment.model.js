import mongoose from "mongoose";

const assignmentSchema = new mongoose.Schema({

    requestId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"StaffingRequest",
        required:true
    },

    professionalId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Professional",
        required:true
    },

    applicationId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Application",
        required:true
    },

    status:{
        type:String,
        enum:[
            "ACTIVE",
            "COMPLETED",
            "CANCELLED"
        ],
        default:"ACTIVE"
    }

},{
    timestamps:true
});

export default mongoose.model(
    "Assignment",
    assignmentSchema
);