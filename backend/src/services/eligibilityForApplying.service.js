export const checkEligibility = (
    professional,
    request
)=>{

    // Check doctor/nurse type

    if(
        professional.role !== request.requiredRole
    ){

        return {
            eligible:false,
            reason:"Required professional role does not match"
        };

    }

    // Check experience

    if(
        professional.experienceYears <
        request.requiredExperience
    ){

        return {
            eligible:false,
            reason:"Insufficient experience"
        };

    }

    // Check specialization

    if(
        request.specialization &&
        professional.specialization !== request.specialization
    ){

        return {
            eligible:false,
            reason:"Specialization does not match"
        };

    }

    return {
        eligible:true
    };

};