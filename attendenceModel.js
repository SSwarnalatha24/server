// attendenceModel.js

const mongoose = require('mongoose');

const attendenceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  clockInTime: {
    type: Date,
  },
  clockOutTime: {
    type: Date,
  },
  totalWorkDuration: {
    type: Number,
  },
  totalBreakDuration: {
    type: Number,
  },
  AttendenceStatus: {
    type: String,
  },
  //Permission:{
  //   type:Number,
  // }, 
  email: {
    type: String,
    required: true
  },
  isClockedOut: {
    type: String  
  },
  islatelogin:{
        type:String,
  }
});

const Attendence = mongoose.model('Attendence', attendenceSchema);

module.exports = Attendence;
