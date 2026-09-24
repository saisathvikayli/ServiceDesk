import { model, Schema } from "mongoose";
const userSchema = new Schema({
    name:{
        type:String,
        required:[true,"plese enter username to proceed"],
        unique:true,
        trim:true,
         },

    email:{
            type:String,
            required:[true,"enter email to proceed"],
            unique:true,
        },
    passwordHash:{
           type:String,
           required:true,
           minlength:8
    },
    role:{
        type:String,
        required:true
    },

    departmentId:{
        type:Schema.Types.ObjectId,
        ref:"Department"
    },

    createdAt:{
        type:Date,
        default:Date.now
    }

})

export default model("User",userSchema)