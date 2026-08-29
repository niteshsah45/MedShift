import Assignment from "../models/assignment.model.js";
import Professional from "../models/professional.model.js";

import { getHospitalAssignmentsService } from "../services/assignment.service.js";
import { completeAssignmentService } from "../services/assignment.service.js";
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
            "department shiftDate startTime endTime location pay"
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
