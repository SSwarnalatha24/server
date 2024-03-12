const mongoose = require('mongoose');

const holidaySchema = new mongoose.Schema({
  holidayDate: {
    type: Date,
    
  },
  day: {
    type: String,
    
  },
  nameOfHolidays: {
   type:String,
  },
  
});

const Listholiday = mongoose.model('Holiday', holidaySchema);

module.exports = Listholiday;
