// cartModel.js

const mongoose = require('mongoose');

const leaveSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  leaveType: {
    type: String,
    required: true
  },
  startDate: {
    type: Date,
    
  },
  endDate: {
    type: Date
  },
  email:{
    type: String,
    required : true
  },
  reason:{
    type:String,
  },
  appliedon:{
    type: Date
  },
leavestatus:{
  type:String
},
numberofdays:{
  type: Number
},
// attachment:{
//    type: String,
// },


});

const Leave = mongoose.model('Leave', leaveSchema);

module.exports = Leave; 
