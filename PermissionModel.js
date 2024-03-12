const mongoose = require('mongoose');
const PermissionSchema = new mongoose.Schema({
    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    reason:{
        type: String,
    },
    fromTime:{
        type: TimeRanges,
    },
    endTime:{
        type:TimeRanges,
    },
    duration:{
        type:Number,
    },
    
});
// const Permission = mongoose.model('Permission',PermissionSchema);
// module.exports=Permission;
const Permission = mongoose.model('Permission',Permission);
module.exports = Permission;