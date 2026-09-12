import Hospital from "../models/hospital.model.js";

import  { getMyHospitalService, updateMyHospitalService } from "../services/hospitalProfile.service.js";


export const createHospitalProfile = async(req,res)=>{

    try{

        const existingHospital =
            await Hospital.findOne({
                userId:req.user.id
            });


        if(existingHospital){

            return res.status(409).json({
                success:false,
                message:"Hospital profile already exists"
            });

        }

        const hospital =
            await Hospital.create({

                userId:req.user.id,

                ...req.body

            });



        res.status(201).json({

            success:true,

            data:hospital,

            message:"Hospital profile created"

        });


    }catch(error){

        res.status(500).json({
            success:false,
            message:error.message
        });

    }

};

export const getMyHospital = async (req, res) => {

    try {

        const hospital = await getMyHospitalService(req.user.id);

        res.status(200).json({
            success: true,
            data: hospital
        });

    } catch (error) {

        res.status(404).json({
            success: false,
            message: error.message
        });
    }
};

export const updateMyHospital = async (req, res) => {

    try {

        const hospital = await updateMyHospitalService(
            req.user.id,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Hospital profile updated successfully",
            data: hospital
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};