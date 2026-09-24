import mongoose from "mongoose";


const hospitalSchema = new mongoose.Schema(
{
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
        unique:true
    },


    hospitalName:{
        type:String,
        required:true,
        trim:true
    },


    address:{
        type:String,
        required:true
    },


    city:{
        type:String,
        required:true
    },


    departments:[
        String
    ],


    verificationStatus:{
        type:String,
        enum:[
            "PENDING",
            "APPROVED",
            "REJECTED"
        ],
        default:"PENDING"
    },
    verificationRejectionReason: {
    type: String,
    default: null
    }

},
{
    timestamps:true
}
);


const Hospital =
mongoose.model(
    "Hospital",
    hospitalSchema
);


export default Hospital;