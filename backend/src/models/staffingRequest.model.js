import mongoose from "mongoose";

const staffingRequestSchema = new mongoose.Schema(
{
    hospitalId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Hospital",
        required:true
    },


    department:{
        type:String,
        required:true
    },


    requiredRole:{
        type:String,
        enum:[
            "doctor",
            "nurse"
        ],
        required:true
    },


    specialization:{
        type:String,
        required:true
    },


    requiredExperience:{
        type:Number,
        default:0,
        required:true
    },


    shiftDate:{
        type:Date,
        required:true
    },


    startTime:{
        type:String,
        required:true
    },


    endTime:{
        type:String,
        required:true
    },


    pay:{
        type:Number,
        required:true
    },


    positions:{
        type:Number,
        required:true
    },

    location:{
        type:String,
        required:true
    },
    
    positionsFilled:{
        type:Number,
        default:0
    },

    status:{
        type:String,
        enum:[
            "OPEN",
            "FILLED",
            "CLOSED",
            "EXPIRED"
        ],
        default:"OPEN"
    }

},
{
    timestamps:true
}
);


const StaffingRequest =
mongoose.model(
    "StaffingRequest",
    staffingRequestSchema
);


export default StaffingRequest;