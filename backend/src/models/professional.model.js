import mongoose from "mongoose";


const professionalSchema = new mongoose.Schema(
    {

        userId:{
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
            unique:true
        },


        name:{
            type:String,
            required:true,
            trim:true
        },


        role:{
            type:String,
            enum:["doctor","nurse"],
            required:true
        },


        specialization:{
            type:String,
            trim:true
        },


        experienceYears:{
            type:Number,
            default:0
        },


        qualifications:[
            String
        ],

        city:{
            type:String,
            required:true,
        },

        verificationStatus:{
            type:String,
            enum:[
                "PENDING",
                "APPROVED",
                "REJECTED"
            ],
            default:"PENDING"
        }

    },
    {
        timestamps:true
    }
);


const Professional =
mongoose.model(
    "Professional",
    professionalSchema
);


export default Professional;