export const validateRegister = (data)=>{

    const {email,password,role}=data;


    if(!email || !password || !role){
        throw new Error("All fields are required");
    }


    if(password.length < 6){
        throw new Error("Password must be at least 6 characters");
    }


    return true;
};