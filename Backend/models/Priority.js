import { model, Schema } from "mongoose";
const prioirtySchema = new Schema({

    p_name:{
        type:String,
        required:true,
    },
    
    level:{
        type:Number,
        requried:true
    },

    slaHours:{
        type:Number,
        requried:true
    }
})

export default model("Priority",prioirtySchema)