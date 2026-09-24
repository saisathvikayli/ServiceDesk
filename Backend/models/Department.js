import { model, Schema } from "mongoose";
const departmentSchema=new Schema({

    name:{
        type:String,
        required:[true,"enter department name to proceed"]
    },

    code:{
        type:String,
        required:true
    }
})   
export default model("Department",departmentSchema)