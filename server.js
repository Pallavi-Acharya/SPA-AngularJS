/**Start of Server code written in Node JS to handlw write ,delete and edit to a file */

/**Express modules added */
var express = require('express');
app = express();
var fs = require('fs'); //File system module inclded to read file from local

/**Body Parser to handle body object of POST and PUT Method */
var bodyParser = require('body-parser');
app.use(bodyParser.json());

app.use(express.static(__dirname + '/')); //using the directory 

/**GET Method to fetch all the PAtient details from file */
app.get('/customer', function(req, res) {
 console.log("inside")
 var obj = JSON.parse(fs.readFileSync('./patientDetails.json', 'utf8'));
 res.json(obj); //sending the response
});
/**End of GET Method */

/**Start of POST call to push the data into file */
app.post('/saveDetails', function(req, res) {
 console.log("Inside POST");

 var obj = JSON.parse(fs.readFileSync('./patientDetails.json', 'utf8'));
 req.body.body.visit = []; //Adding an empty visit object to each data that has been added
 obj.push(JSON.parse(req.body.body)); //pushing the data to object
 var json = JSON.stringify(obj); //converting to JSON
 /**Writing the new data to file */
 fs.writeFile("./patientDetails.json", json, function(err, data) {
  if (err) console.log(err);
 });
});
/**Start of DELETE method to delete Patient record from file */
app.delete('/deletePatient/:id', function(req, res) {
 var pid = req.params.id; //Fetching the patient ID
 var obj = JSON.parse(fs.readFileSync('./patientDetails.json', 'utf8'));
 for (var i = 0; i < obj.length; i++) { //Looping through the array of patient objects
  if (pid == obj[i].id) {
   obj.splice(i, 1); //Delete record if, id matches
  }
 }
 var json = JSON.stringify(obj);
 /**Writing the new data to file */
 fs.writeFile("./patientDetails.json", json, function(err, data) {
  if (err) console.log(err);
 });
 res.send(req.params.id);
});
/**End of Delete Method */

/**Start of PUT method to edit the patient record */
app.put('/editPatient', function(req, res) {
 var reqObject = JSON.parse(req.body.body); //Data recieved
 var pid = reqObject.id; //id of patient recieved
 console.log("Inside Edit");
 console.log("Pid is" + pid);
 var obj = JSON.parse(fs.readFileSync('./patientDetails.json', 'utf8')); //Reading the file
 /**Looping through the array of objects */
 for (var i = 0; i < obj.length; i++) {
  if (pid == obj[i].id) {
   obj.splice(i, 1, reqObject); //Delete if id matches
  }
 }
 var json = JSON.stringify(obj);
 /**Writing the new data to file */
 fs.writeFile("./patientDetails.json", json, function(err, data) {
  if (err) console.log(err);

 });
});
/**End of PUT method */

/**Start of GET Method to Fetch Visit details of Patient */
app.get('/visitDetails/:id', function(req, res) {
 var pid = req.params.id;
 var obj = JSON.parse(fs.readFileSync('./patientDetails.json', 'utf8')); //Read the file
 for (var i = 0; i < obj.length; i++) {
  if (pid == obj[i].id) { //If id matches
   if (obj[i].visit) { //If the patient record has visit as property
    res.json(obj[i].visit); //then send vidit details
   } else res.json(null);
  }
 }
});
/**End of GET visit details of patient */

/**Start of POST method to Edit the visit detail of a patient */
app.post('/addEditVisit', function(req, res) {
 console.log("Inside POST Visit");
 console.log("Data received is ");
 var docData = req.body.data; //data recieved
 console.log(docData);
 var patientId = req.body.pid; //Fetching Patient id
 console.log(patientId);
 var obj = JSON.parse(fs.readFileSync('./patientDetails.json', 'utf8')); //Reading file
 outer:
  for (var i = 0; i < obj.length; i++) { //Loopong thorugh Patient record
   if (patientId == obj[i].id) { //if ID matches
    if (obj[i].visit) { //if Patient has visit
     inner: for (var j = 0; j < obj[i].visit.length; j++) { //Looping through Visit
      console.log("Print data");
      console.log(obj[i].visit[j].id);
      console.log(docData.id)
      if (obj[i].visit[j].id == docData.id) { //if id in record and id sent matches 
       console.log("inside inner")
       console.log("Yes");
       obj[i].visit.splice(j, 1, docData); //then push the changed data
       break;
      } else {
       continue;
      }
     }
    }
    else {
     console.log("Inside else");
     obj[i].visit = []; //add empty visit
     docData.id = 1;
     obj[i].visit.push(docData); //else push new record
     break;
    }
   }
  }
 var json = JSON.stringify(obj);
 /**Writing the new data to file */
 fs.writeFile("./patientDetails.json", json, function(err, data) {
  if (err) console.log(err);
  console.log("Successfully Written to File.");
 });
});
/**END of POST Method to edit the visit details of patient */

/**Start of POST call to add new visit details */
app.post('/addVisit', function(req, res) {
 console.log("Inside POST Visit");
 console.log("Data received is ");
 var docData = req.body.data; //Data recieved
 console.log(docData);
 var patientId = req.body.pid; //Patient Id recieved
 console.log(patientId);
 var obj = JSON.parse(fs.readFileSync('./patientDetails.json', 'utf8')); //Reading the file
 for (var i = 0; i < obj.length; i++) {
  if (patientId == obj[i].id) {
   if (obj[i].visit == undefined) { //if no visit data present
    obj[i].visit = []; //add visit
    docData.id = 1; //add id
    break;
   } else {
    docData.id = obj[i].visit[obj[i].visit.length - 1].id + 1; //Else fetch the last id and add 1 , assign to new record
    break;
   }
  }
 }
 obj[i].visit.push(docData) //Push the data to object
 var json = JSON.stringify(obj);
 /**Writing the new data to file */
 fs.writeFile("./patientDetails.json", json, function(err, data) {
  if (err) console.log(err);
  console.log("Successfully Written to File.");
 });
});

/**Server listening at port */
app.listen(8080);
console.log("App listening at :8080");

/**End Of server code */