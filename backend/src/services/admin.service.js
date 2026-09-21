import Professional from "../models/professional.model.js";
import Hospital from "../models/hospital.model.js";
import StaffingRequest from "../models/staffingRequest.model.js";
import Assignment from "../models/assignment.model.js";
import Application from "../models/application.model.js";
import VerificationDocument from "../models/verification.model.js";

export const getAdminDashboardService = async () => {

    const [
        totalProfessionals,
        totalHospitals,
        totalStaffingRequests,
        openStaffingRequests,
        activeAssignments,
        completedAssignments,
        totalApplications,
        pendingProfessionalVerifications,
        pendingHospitalVerifications
    ] = await Promise.all([

        Professional.countDocuments(),

        Hospital.countDocuments(),

        StaffingRequest.countDocuments(),

        StaffingRequest.countDocuments({
            status: "OPEN"
        }),

        Assignment.countDocuments({
            status: "ACTIVE"
        }),

        Assignment.countDocuments({
            status: "COMPLETED"
        }),

        Application.countDocuments(),

        VerificationDocument.countDocuments({
            status: "PENDING"
        }),

        Hospital.countDocuments({
            verificationStatus: "PENDING"
        })

    ]);

    return {
        totalProfessionals,
        totalHospitals,

        totalStaffingRequests,
        openStaffingRequests,

        activeAssignments,
        completedAssignments,

        totalApplications,

        pendingProfessionalVerifications,
        pendingHospitalVerifications
    };
};