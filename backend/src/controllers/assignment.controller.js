import Assignment from "../models/assignment.model.js";
import Professional from "../models/professional.model.js";


import {
    getHospitalAssignmentsService,
    completeAssignmentService,
    cancelAssignmentFromProfessional,
    cancelAssignmentFromHospital,
} from "../services/assignment.service.js";

// for professionals to get their assignments
export const getMyAssignments = async (req, res) => {

    try {

        const professional = await Professional.findOne({
            userId: req.user.id
        });

        if (!professional) {
            return res.status(404).json({
                success: false,
                message: "Professional profile not found"
            });
        }

        const assignments = await Assignment.find({
            professionalId: professional._id
        })
        .populate(
            "requestId",
            "department startAt endAt location pay"
        );

        res.status(200).json({
            success: true,
            data: assignments
        });

    } catch (error) {

        res.status(500).json({
            success: false,
            message: error.message
        });

    }
};

// for hospitals to get their assignments

export const getHospitalAssignments = async (req, res) => {

    try {

        const assignments =
            await getHospitalAssignmentsService(
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: assignments
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }
};

// for hospitals to mark an assignment as completed
export const completeAssignment = async (req, res) => {

    try {

        const { assignmentId } = req.params;

        const assignment =
            await completeAssignmentService(
                assignmentId,
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: assignment,
            message: "Assignment completed"
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });

    }
};

// professionals can cancel an assignment

export const cancelAssignmentByProfessional = async (
    req,
    res
) => {

    try {

        const { assignmentId } =
            req.params;

        const result =
            await cancelAssignmentFromProfessional(
                assignmentId,
                req.user.id
            );

        res.status(200).json({
            success: true,
            data: result,
            message:
                "Assignment cancelled successfully"
        });

    } catch (error) {

        res.status(400).json({
            success: false,
            message: error.message
        });
    }
};

// Hospital cancel an assignment
export const cancelAssignmentByHospital =
    async (req, res) => {

        try {

            const { assignmentId } =
                req.params;

            const result =
                await cancelAssignmentFromHospital(
                    assignmentId,
                    req.user.id
                );

            res.status(200).json({
                success: true,
                data: result,
                message:
                    "Assignment cancelled by hospital"
            });

        } catch (error) {

            res.status(400).json({
                success: false,
                message: error.message
            });
        }
    };
