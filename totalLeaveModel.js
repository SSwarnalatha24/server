

const mongoose = require('mongoose');

const totalLeaveSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email:{
    type:String,
    required : true
  },
  totalleavesavailable: {
    type: Number,
  },
  totalsickleavesavailable: {
    type: Number,
    
  },
  totalperleavesavailable: {
    type: Number,
  },
 
  totalleavestaken:{
    type:Number,
  },
  totalsickleavestaken:{
    type: Number,
  },
totalperleavestaken:{
  type:Number
},


});

const totalLeave = mongoose.model('totalLeave', totalLeaveSchema);

module.exports = totalLeave;
