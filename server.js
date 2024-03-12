const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cors = require('cors');
const User = require('./userModel');
const leave = require('./leaveModel');
const Attendence = require('./attendenceModel');
const bcrypt = require('bcrypt');
const Leave = require('./leaveModel');
const totalLeave = require('./totalLeaveModel');
const Listholiday = require('./holidayModel');
// const Permission= require('./PermissionModel');
//const Permission = require ('./PermissionModel');
const app= express();
 const port = 5000;

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cors());

mongoose.connect('mongodb+srv://swarna:swarna987@cluster0.lcwt9ys.mongodb.net/', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('Mongodb Connected'));



// Define the POST endpoint for user registration
app.post('/api/newuser', async (req, res) => {
  try {
    const { username, password, email, userRole } = req.body.newUser;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ success: false, message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10); // 10 is the number of salt rounds

    const newUser = new User({ username, password: hashedPassword, email, userRole });
    await newUser.save();

    res.status(201).json({ success: true, message: 'User created successfully' });
  } catch (error) {
    console.error('Error creating user:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});



app.post('/api/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(400).json({ success: false, message: 'User does not exist' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid password' });
    }


    res.status(200).json({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error('Error logging in:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});




app.get('/api/activeuser', async (req, res) => {
  try {
    const userEmail = req.query.userEmail;

    // Use await to wait for the User.findOne promise to resolve
    const user = await User.findOne({ email: userEmail });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const username = user.username;

    res.status(200).json({ username: username, userRole: user.userRole }); // Send the username in the response
  } catch (error) {
    console.error("Error Fetching Active user", error);
    res.status(500).json({ error: 'Server error' });
  }
});

// server.js

// ... (previous code)

app.post('/api/addToCart', async (req, res) => {
  try {
    const { id, name, price, image } = req.body;
    const userEmail = req.body.email;
    const userfind = await User.findOne({ email: userEmail }, { _id: 0 });
    const user = userfind.username;
    const newItem = new Cart({
      name: name,
      price: price,
      image: image,
      email: userEmail, // Add the email to the cart item
      // Add other fields as needed
    }); 

    await newItem.save();
    res.status(200).send('Item added to cart');
  } catch (error) {
    console.error('Error adding to cart:', error);
    res.status(500).send('Error adding to cart');
  }
});


app.get('/api/cartItems/:userEmail', async (req, res) => {
  try {
    const userEmail = req.params.userEmail;
    const cartItems = await Cart.find({ email: userEmail }); // Modify the query to use userEmail
    res.status(200).json(cartItems);
  } catch (error) {
    console.error('Error fetching cart items:', error);
    res.status(500).send('Error fetching cart items');
  }
});


// DELETE request to remove an item from the cart
app.delete('/api/holiday/:id', async (req, res) => {
  try {
    const itemId = req.params.id;
    await Cart.deleteOne({ _id: itemId });
    res.status(200).json({ message: 'Item removed from the cart' });
  } catch (error) {
    console.error('Error deleting item from cart:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});



app.listen(port, () => {
  console.log(`Server listening on port ${port}`);
});


// Attendence log API
// to capture clock IN
app.post('/api/attendenceLog', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0]; // Get the current date (YYYY-MM-DD)
    const currentdate = new Date();
    const firstDay = new Date(currentdate.getFullYear(), currentdate.getMonth(), 2).toISOString().split('T')[0];
    const lastDay = new Date(currentdate.getFullYear(), currentdate.getMonth() + 1, 1).toISOString().split('T')[0];
    console.log("firstday lastday", firstDay, lastDay);
    const userEmail = req.body.email;

    // Check if a record already exists for today
    const existingRecord = await Attendence.findOne({ $and: [{ email: { $eq: userEmail } }, { date: { $gte: today } }] });
    const monthlylatelogin = await Attendence.find({ $and: [{ email: { $eq: userEmail } }, { islatelogin: { $eq: "Y" } }, { date: { $gte: firstDay, $lte: lastDay } }] });
    console.log("monthlylatelogin", monthlylatelogin, monthlylatelogin.length);
    if (existingRecord) {
      return res.status(400).json({ message: 'Record already exists for today' });
    } else {
      const { id, WorkstartTime, WorkendTime, totalBreakTime, totalWorkTime, islatelogin,Permission } = req.body;
      const userfind = await User.findOne({ email: userEmail }, { _id: 0 });
      const user = userfind.username;
      const newItem = new Attendence({
        name: user,
        clockInTime: WorkstartTime,
        clockOutTime: WorkendTime,
        totalWorkDuration: totalWorkTime,
        totalBreakDuration: totalBreakTime,
        islatelogin: islatelogin,
        AttendenceStatus: Math.floor(totalWorkTime / 1000 / 60) > 2 ? "P" : "A",
        email: userEmail,
        date: today,
        isClockedOut: "N",
        Permission:Permission
        // Add other fields as needed
      });

      await newItem.save();
      if (islatelogin == "Y" && monthlylatelogin.length < 2) {
        res.status(200).json({ message: 'Attendence logged in system but late login' });
      } else if (islatelogin == "Y" && monthlylatelogin.length >= 2) {
        res.status(200).json({ message: 'Attendence logged in system with status absent' });
      } else {
        res.status(200).json({ message: 'Attendence logged in system' });
      }
    }
  } catch (error) {
    console.error('Error logging attendence:', error);
    res.status(500).json({ message: 'Error logging attendence:' });
  }
});

// to get user Attendence 
app.get('/api/allAttendence/:userEmail', async (req, res) => {
  try {
    const userEmail = req.params.userEmail;
    const allAttendence = await Attendence.find({ email: userEmail }); // Modify the query to use userEmail
    res.status(200).json(allAttendence);
  } catch (error) {
    console.error('Error fetching attendence items:', error);
    res.status(500).send('Error fetching attendece items');
  }
});
// to get admin attendence
app.get('/api/allEmpAttend', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const todayallEmpAttend = await Attendence.find({ date: { $gte: today } });
    res.status(200).json(todayallEmpAttend)
  } catch (error) {
    console.error('Error fetching attendence items:', error);
    res.status(500).send('Error fetching attendence items');
  }
}
)

// to get single Item from Attendence 
app.get('/api/singleAttendence/:userEmail', async (req, res) => {
  try {
    const userEmail = req.params.userEmail;
    const today = new Date().toISOString().split('T')[0]; // Get the current date (YYYY-MM-DD)
    const todayAttendence = await Attendence.find({ $and: [{ email: { $eq: userEmail } }, { date: { $gte: today } }] });
    res.status(200).json(todayAttendence)
  } catch (error) {
    console.error('Error fetching attendence items:', error);
    res.status(500).send('Error fetching attendece items');
  }
})
//find the total employees leaves
app.get('/api/totalempleaves/:userEmail', async (req, res) => {
  try {
    const userEmail = req.params.userEmail;
    //const today = new Date().toISOString().split('T')[0]; // Get the current date (YYYY-MM-DD)
    const totalempleaves = await totalLeave.find({ email: { $eq: userEmail } });
    res.status(200).json(totalempleaves)
  } catch (error) {
    console.error('Error fetching :', error);
    res.status(500).send('Error fetching ');
  }
})

// update attendence log API 
app.post('/api/updateAttendence/:id', async (req, res) => {
  try {
    const userEmail = req.body.email;

    const today = new Date().toISOString().split('T')[0]; // Get the current date (YYYY-MM-DD)
    // Check if a record already exists for today
    const currentdate = new Date();
    const firstDay = new Date(currentdate.getFullYear(), currentdate.getMonth(), 2).toISOString().split('T')[0];
    const lastDay = new Date(currentdate.getFullYear(), currentdate.getMonth() + 1, 1).toISOString().split('T')[0];
    console.log("firstday lastday", firstDay, lastDay);
    const ClockedOutRecord = await Attendence.findOne({ $and: [{ email: { $eq: userEmail } }, { isClockedOut: { $eq: "Y" } }, { date: { $gte: today } }] });
    const monthlylatelogin = await Attendence.find({ $and: [{ email: { $eq: userEmail } }, { islatelogin: { $eq: "Y" } }, { date: { $gte: firstDay, $lte: lastDay } }] });
    console.log("monthlylatelogin", monthlylatelogin, monthlylatelogin.length);
    console.log("clockedout", ClockedOutRecord);
    if (ClockedOutRecord) {
      return res.status(400).json({ message: 'Record already Clocked out for today' });
    } else {
      const { updateID, realstartTime, EndTime, totalBreakTime, totalWorkDuration } = req.body;
      const userfind = await User.findOne({ email: userEmail }, { _id: 0 });
      const user = userfind.username;
      const objectId = req.body.updateID;
      let setStatus
      if ((islatelogin == "Y" && Math.floor(totalWorkDuration / 1000 / 60) > 2 && monthlylatelogin.length < 2) ||
        (islatelogin = "N" && Math.floor(totalWorkDuration / 1000 / 60) >= 2)) {
        setStatus = "P";
      } else if ((islatelogin == "Y" && Math.floor(totalWorkDuration / 1000 / 60) <= 2 && monthlylatelogin.length > 2) ||
        (islatelogin == "N" && Math.floor(totalWorkDuration / 1000 / 60) < 2)) {
        setStatus = "A";
      }
      const updateItem = {
        clockOutTime: EndTime,
        totalWorkDuration: totalWorkDuration,
        totalBreakDuration: totalBreakTime,
        //islatelogin:islatelogin,
        AttendenceStatus: setStatus,
        isClockedOut: "Y"
      }
      console.log("updateItem", updateItem);
      // Update the user's balance in the database based on their email
      const updatedDate = await Attendence.findByIdAndUpdate({ _id: objectId }, { $set: updateItem });

      if (!updatedDate) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      res.status(200).json({ success: true, message: 'Clocked out successfully' });
    }

  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
//api used for leave application
//apply leave api
app.post('/api/applyleave', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const userEmail = req.body.email;
    const { id, leaveType, startDate, endDate, numberofdays, reason , attachment } = req.body;
    const userfind = await User.findOne({ email: userEmail }, { _id: 0 });
    console.log("username", userfind);
    const user = userfind.username;
    // Check if a record already exists for today
    const existingRecord = await leave.findOne({ $and: [{ email: { $eq: userEmail } }, { startDate: { $gte: startDate } }] });
    if (existingRecord) {
      res.status(400).json({ message: 'already leave applied for the start date' });
    } else {
      const newItem = new leave({
        name: user,
        leaveType: leaveType,
        startDate: startDate,
        endDate: endDate,
        reason: reason,
        leavestatus: "applied",
        email: userEmail,
        appliedon: today,
        numberofdays: numberofdays,
        attachment: attachment,

        // Add other fields as needed
      });
      console.log("data", newItem);
      await newItem.save();
      res.status(200).json({ message: 'leave applied successfully' })
    }

  }
  catch (error) {
    console.error('Error while applying leave:', error);
    res.status(500).json({ message: 'Error while applying leave:' });
  }
});

app.get('/api/allLeave/:userEmail', async (req, res) => {
  try {
    const userEmail = req.params.userEmail;
    const allLeave = await Leave.find({ email: userEmail }); // Modify the query to use userEmail
    res.status(200).json(allLeave);
  } catch (error) {
    console.error('Error fetching in approved on leave:', error);
    res.status(500).send('Error fetching leave forms');
  }
});
app.get('/api/EmpLeave/', async (req, res) => {
  try {
    //const today = new Date().toISOString().split('T')[0]; // Get the current date (YYYY-MM-DD)
    const EmpLeave = await Leave.find();
    console.log(EmpLeave);
    res.status(200).json(EmpLeave)
  } catch (error) {
    console.error('Error fetching attendence items:', error);
    res.status(500).send('Error fetching attendece items');
  }
});
// to create leave count 
app.post('/api/addLeaveCount', async (req, res) => {
  try {
    const { id, totalleavestaken, totalsickleavestaken, totalperleavestaken } = req.body;
    const userEmail = req.body.email;
    const userfind = await User.findOne({ email: userEmail }, { _id: 0 });
    const user = userfind.username;
    const newItem = new totalLeave({
      name: user,
      totalleavesavailable: "12",
      totalsickleavesavailable: "6",
      totalperleavesavailable: "6",
      totalleavestaken: totalleavestaken,
      totalsickleavestaken: totalsickleavestaken,
      totalperleavestaken: totalperleavestaken,
      email: userEmail,
    });
    await newItem.save();
    res.status(200).send('Leave Counts added Successfully');
  } catch (error) {
    console.error('Error adding leave count:', error);
    res.status(500).send('Error adding leave count');
  }
});

// update leave count API 
app.post('/api/UpdateLeaveCount/:id', async (req, res) => {
  try {
    const { updateID, totalleavestaken, totalsickleavestaken, totalperleavestaken } = req.body;
    const userEmail = req.body.email;
    const userfind = await User.findOne({ email: userEmail }, { _id: 0 });
    const objectId = req.body.updateID;
    const updateItem = {
      totalleavestaken: totalleavestaken,
      totalsickleavestaken: totalsickleavestaken,
      totalperleavestaken: totalperleavestaken,
    }
    console.log("updateItem", updateItem);
    // Update the user's leave count in the database based on their email
    const updatedCounts = await totalLeave.findByIdAndUpdate({ _id: objectId }, { $set: updateItem });

    if (!updatedCounts) {
      return res.status(404).json({ success: false, message: 'data not found' });
    }
    res.status(200).json({ success: true, message: 'Leave Count updated successfully' });
  } catch (error) {
    console.error('Error updating data:', error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
});
//holiday get api
app.get('/api/holiday', async (req, res) => {
  try {
    const holiday = await Listholiday.find();
    console.log(holiday);
    res.status(200).json(holiday)
  } catch (error) {
    console.error('Error fetching attendence items:', error);
    res.status(500).send('Error fetching attendece items');
  }
});
//add holidays
app.post('/api/addholidays', async (req, res) => {
  try {
    const { holidayDate, day, nameOfHolidays } = req.body;
    console.log("add holiday", req.body)
    const newItem = new Listholiday({
      holidayDate: holidayDate,
      day: day,
      nameOfHolidays: nameOfHolidays,
      
    });

    await newItem.save();
    res.status(200).send('Holiday added');
  } catch (error) {
    console.error('Error adding to holiday:', error);
    res.status(500).send('Error adding to holiday');
  }
});

//apply permission
app.post('/api/applypermission', async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const userEmail = req.body.email;
    const { id, duration, startTime, endTime, reason } = req.body;
    const userfind = await User.findOne({ email: userEmail }, { _id: 0 });
    console.log("username", userfind);
    const user = userfind.username;
    // Check if a record already exists for today
    const existingRecord = await leave.findOne({ $and: [{ email: { $eq: userEmail } }, { startDate: { $gte: startDate } }] });
    if (existingRecord) {
      res.status(400).json({ message: 'already permission applied for the starting time' });
    } else {
      const newItem = new Permission({
        name: user,
        
        startTime: startTime,
        endTime: endTime,
        reason: reason,
        duration:duration,
        email: userEmail,
        
        numberofdays: numberofdays,
        

        // Add other fields as needed
      });
      console.log("data", newItem);
      await newItem.save();
      res.status(200).json({ message: 'leave applied successfully' })
    }

  }

  catch (error) {
    console.error('Error while applying leave:', error);
    res.status(500).json({ message: 'Error while applying leave:' });
  }
});


