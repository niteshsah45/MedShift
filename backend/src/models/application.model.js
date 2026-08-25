import mongoose from "mongoose";


const applicationSchema = new mongoose.Schema(
{
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


    status:{
        type:String,
        enum:[
            "PENDING",
            "ACCEPTED",
            "REJECTED",
            "WITHDRAWN"
        ],
        default:"PENDING"
    }

},
{
    timestamps:true
}
);


// prevent same professional applying twice
applicationSchema.index(
    {
        requestId:1,
        professionalId:1
    },
    {
        unique:true
    }
);


const Application =
mongoose.model(
    "Application",
    applicationSchema
);


export default Application;