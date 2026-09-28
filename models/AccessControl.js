const mongoose = require("mongoose");
const accessControlSchema = new mongoose.Schema({key:{type:String,required:true,unique:true,trim:true},passwordHash:{type:String,required:true}},{timestamps:true});
module.exports = mongoose.model("AccessControl", accessControlSchema);
