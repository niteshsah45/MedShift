export const allowRoles = (...allowedRoles) => {

    return (req,res,next)=>{

        console.log("Allowed roles:", allowedRoles);
        console.log("Current user:", req.user);


        if(!allowedRoles.includes(req.user.role)){

            return res.status(403).json({
                success:false,
                message:"Access denied"
            });

        }


        next();

    };

};