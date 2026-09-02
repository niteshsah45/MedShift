import Professional from "../models/professional.model.js";
import {getMyProfessionalService, updateMyProfessionalService} from "../services/professionalProfile.service.js";

export const createProfessionalProfile = async(req,res)=>{

    try{

        const existingProfile =
            await Professional.findOne({
                userId:req.user.id
            });


        if(existingProfile){

            return res.status(409).json({
                success:false,
                message:"Professional profile already exists"
            });

        }

        const professional =
            await Professional.create({

                userId:req.user.id,

                ...req.body

            });

        res.status(201).json({

            success:true,

            data:professional,

            message:"Professional profile created"

        });

    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

// profile retrieval and update functions

export const getMyProfessional = async (req, res) => {

    try {

        const professional = await getMyProfessionalService(
            req.user.id
        );

        res.status(200).json({
            success: true,
            data: professional
        });

    } catch (error) {

        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};


export const updateMyProfessional = async (req, res) => {

    try {

        const professional = await updateMyProfessionalService(
            req.user.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Professional profile updated successfully",
            data: professional
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};