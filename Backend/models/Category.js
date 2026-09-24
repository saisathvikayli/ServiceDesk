import { model, Schema } from "mongoose";
const categorySchema=new Schema({
    cat_name:{
        type:String,
        required:true
    },

    default_priority:{
        type:Number,
        required:true
    }

})

export default model("Category",categorySchema)