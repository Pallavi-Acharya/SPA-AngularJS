/* start of Main JS file, container of many controllers,modules , services and routing */

/*Initialise the angularJS app, and add dependencies */
/*Initialising angualr JS app */
var app = angular.module("patientApp", ['ui.router', 'ngRoute']);

/* Angular JS run method to Authenticate */
app.run(function($rootScope, $location, $state, LoginService) {
 $rootScope.$on('$stateChangeStart',
  function(event, toState, toParams, fromState, fromParams) {
   $rootScope.statusValue = toState.name;

   console.log('Changed state to: ' + toState);
   console.log($rootScope.statusValue)
  });

 if (!LoginService.isAuthenticated()) {
  $state.transitionTo('login');
 }
});
/*End of Angular Run Method */

/*Angular LoginController created to handle logic for login */
app.controller('LoginController', function($scope, $rootScope, $stateParams, $state, LoginService) {
 $rootScope.title = "Portal Login ";

 /*Form submit method to  handle login,after checking the login credentials*/
 $scope.formSubmit = function() {
  if (LoginService.login($scope.username, $scope.password)) {
   $scope.error = '';
   $scope.username = '';
   $scope.password = '';
   $state.transitionTo('home');
  } else {
   $scope.error = "Incorrect username/password !"; //Message that prints if credentials are wrong
  }
 };

});
/*End of Login Controller */

/*Start of Home controller which handles all patient and visit details */
app.controller('HomeController', ['$scope', '$rootScope', '$stateParams', 'ajaxFactory', '$state', 'LoginService', '$http', '$route', function($scope, $rootScope, $stateParams, ajaxFactory, $state, LoginService, $http, $route) {
 $rootScope.title = "Patient Portal";

 /*Variable declared to hold drop down values for weight and height Respectively */
 $scope.weightOptions = ["KGS", "LBS"];
 $scope.heightOptions = ["CM", "FEET"];
 $scope.responseData;

 /*Hold today's date to set constraint on Next Visit date , last Visit Date and Date of Birth feild*/
 var max = new Date();
 $scope.today = max.toISOString();

 $scope.patientName;
 /*Function call to fetch Patient data */
 getAll();

 /*SendData function is called while clicking ADD Patient*/
 $scope.sendData = function() {
  /*Setting all the values to null to make the form empty*/
  $scope.patientName = "";
  $scope.patientAge = "";
  $scope.patientDOB = "";
  $scope.heightValue = "";
  $scope.weightValue = "";
  $scope.patientEmail = "";
  $scope.patientAddress = "";
  $scope.patientPhone = "";
  showIndividualData('individualPatientList'); //Call to Display PatientData 
 };
 /*End of SendData */

 /*Start of saveData,called on click on submit in Add/Edit Patient Data */
 $scope.saveData = function() {
  /*Based on the status value ui-route , deciding to make POST or PUT call */
  /*if Status value is home.add , call POST call push datat to file */
  if ($rootScope.statusValue == "home.add") {
   var requestObject = {};
   requestObject.name = $scope.patientName;
   requestObject.age = $scope.patientAge;
   console.log($scope.responseData)
   if ($scope.dataLength == 0) {
    requestObject.id = 1; //if data record is empty ,make id as 1
   } else {

    getAll();
    requestObject.id = $scope.responseData[$scope.responseData.length - 1].id + 1; //Assigning new ids
   }

   /*Copying all the values to an object, that will be sent to POST call as a body */
   requestObject.DOB = $scope.patientDOB;
   requestObject.heightValue = $scope.heightValue + $scope.patientHeight;
   requestObject.weightValue = $scope.weightValue + $scope.patientWeight;
   requestObject.email = $scope.patientEmail;
   requestObject.address = $scope.patientAddress;
   requestObject.phone = $scope.patientPhone;

   /*Promise object created to hold result of POST call  */
   var reciveData = $http.post('/saveDetails', {
    body: JSON.stringify(requestObject)
   });
   reciveData.then(function(data) {
     console.log("Success" + data); //if POST is success
    },
    function(error) {
     console.log(error); //if POSt errored out
    });
   getAll();
  }

  /*If the Status value of UI route is home.edit, Make PUT call to edit the data and reflect the changed in file */
  if ($rootScope.statusValue == "home.edit") {
   /*Variable created to pass the data to PUT body and copied values from form */
   $scope.editData = {};
   $scope.editData.id = $scope.prevData.id;
   $scope.editData.name = $scope.patientName;
   $scope.editData.age = $scope.patientAge;
   $scope.editData.DOB = $scope.patientDOB;
   $scope.editData.heightValue = $scope.heightValue + $scope.patientHeight;
   $scope.editData.weightValue = $scope.weightValue + $scope.patientWeight;
   $scope.editData.email = $scope.patientEmail;
   $scope.editData.address = $scope.patientAddress;
   $scope.editData.phone = $scope.patientPhone;

   /*Promise Objected created to handle the PUT Method, based on success or failure respective calls are made */
   var editPatient = $http.put('/editPatient', {
    body: JSON.stringify($scope.editData)
   });
   editPatient.then(function(data) {
    console.log("Edit Success"); //PUT success
   }, function(error) {
    console.log("Edit errored out"); //PUT Failure
   });
  }

 };
 /*End Of Save Data */

 /*Delete Patient method is called while cliking red cross mark against repective row to delete row */
 $scope.deletePatient = function(data) {

  /*Promise object is created to handle DELETE patient record based on the id passed */
  var deleteData = $http.delete('/deletePatient/' + data.id);
  deleteData.then(function(data) {
   $route.reload(); //if success,reload
  }, function(error) {
   console.log("Delete errored out" + error); //DELETE Error
  });
 }
 /**End of Delete function */

 //Function to show div element based on id passed
 function showIndividualData(id) {

  document.getElementById(id).style.display = 'block';
 }

 /**Edit Details function is called when user clicks on Edit Pen icon against each row */
 $scope.editDetails = function(data) {

  /**displays div with patient details */
  showIndividualData('individualPatientList');
  /**Storing the previous values */
  $scope.prevData = data;
  $scope.prevData.id = data.id;
  $scope.patientName = data.name;
  $scope.patientAge = data.age;
  $scope.patientDOB = data.DOB;
  $scope.patientHeightValue = data.heightValue;
  $scope.patientWeightValue = data.weightValue;
  $scope.patientEmail = data.email;
  $scope.patientPhone = data.phone;
  $scope.patientAddress = data.address;
 }
 /**End of EditDetails Function */

 /**Start of showPatientDatat */
 $scope.showPatientData = function(data) {
  showIndividualData('patientDet');
  /**Factory MEthod to set the data */
  ajaxFactory.showData(data);
  $scope.clickedData = ajaxFactory.getData(); //Factoty Method to return the data
  delete $scope.clickedData.visit; //This is to avoid the display of VISIT details in Patient Datat
  $scope.showVisit($scope.clickedData.id); //Show Visit function call to display respective patient's visit detail
 }
 /**End of ShowPatientData */

 /**Start of Show Visit Function, to display Visit details of a patient */
 $scope.showVisit = function(id) {
  /**Promise object created to handle GET Call which is return from getVisit of Factory method */
  $scope.visitedData = ajaxFactory.getVisit(id); //factory method to retrieve Visit details of Patient , based on his id passed
  $scope.visitedData.then(function(data) {
   $scope.visitDetails = data.data; //Assigning result to variable to showin UI
   $scope.visitLength = $scope.visitDetails.length; //used for Pagination
   closeVisit(); //After the success call close data
  }, function(error) {
   console.log("Errored V"); //Error GET Call
  });
 }
 /**End of ShowVisit() */

 /**Start of saveNewVisit to add the new visit details to patient record */
 $scope.saveNewVisit = function() {
  /**Promise object created to hold the result of POST Call to add new VISIT */
  var result = ajaxFactory.addNewVisit({
   data: $scope.docVisit,
   pid: $scope.clickedData.id
  });
  result.then(function(data) {
    console.log("Inside Save Visit"); //Success POST ,VISIT
   },
   function(error) {
    console.log("Error Save Visit" + error); //Error POST Visit
   });
  closeVisit(); //Close Visit details div
 }
 /**End of saveNewVisit */

 /**Start of AddVisit function , which is called when ADD Visit is clicked */
 $scope.AddVisit = function(id) {
  showEmptyVisit(); //Calling div with empty form
  $scope.docVisit = null;
 }
 /**End of AddVisit */

 /**Start of function EditVisit, called when EDIT icon against each visit row is clicked */
 $scope.EditVisit = function(data) {
  showVisit(); //Calling to div to display div with selected row
  $scope.docVisit = data;
 }
 /**End of EditVisit function() */
 /**Start of saveDocVisit ,called on submit method of ADD Viit details */
 $scope.saveDocVisit = function() {
  /**Promise object created to hold the result of POST call ,made to store Visit details */
  var result = ajaxFactory.saveVisit({
   data: $scope.docVisit,
   pid: $scope.clickedData.id
  });
  result.then(function(data) {
    console.log("Inside Save Visit"); //Success  POST
   },
   function(error) {
    console.log("Error Save Visit" + error); //Error POST
   });
  closeVisit(); //Cloding div
 }
 /**End of saveDocVisit function */

 /**Javscript functions top handle DOM */
 /**Display Edit Visit div */
 function showVisit() {
  console.log("CAlled Visit")
  document.getElementById('addEditVisit').style.display = 'block';
 }
 /**Display Add Visit div */
 function showEmptyVisit() {
  console.log("Called Add visit");
  document.getElementById('addDocVisit').style.display = 'block';
 }
 /**close edit Visit */
 function closeVisit() {
  document.getElementById('addEditVisit').style.display = 'none';
 }

 /**Function to getALL patient from file */
 function getAll() {
  console.log("CAlled");
  //Factory method to get all Patient details from file
  ajaxFactory.getCustomers()
   .then(function(customers) {
    $scope.responseData = customers.data; //Patient Detail
    $scope.dataLength = $scope.responseData.length; //Length of data for Pagination
    console.log($scope.dataLength);
    console.log($scope.responseData)
   }, function(data, status, header, config) {
    console.log("error is" + status)
   });

 }

 /**Below variable are created to hold Pagination */
 $scope.currentPage = 0;
 $scope.currentVisitPage = 0;

 $scope.pageSize = 3;
 $scope.numberOfPages = function() {
  return Math.ceil($scope.dataLength / $scope.pageSize);
 }
 $scope.numberOfVisitPages = function() {

  return Math.ceil(3 / $scope.pageSize);
 }

}]);
/**End of Home ctroller Logic */

/**Start of Login factory  method to to store the login credentials */
app.factory('LoginService', function() {
 var admin = 'admin'; //username
 var pass = 'pass'; //password
 var isAuthenticated = false; //flag to recognise if login is successfull or failure

 /**Return objects check if the username and password matches */
 return {
  login: function(username, password) {
   isAuthenticated = username === admin && password === pass;
   return isAuthenticated;
  },
  isAuthenticated: function() {
   return isAuthenticated;
  }
 };

});
/**End of Login Factory */

/**Start of Config method to route based on state */
app.config(['$stateProvider', '$urlRouterProvider', function($stateProvider, $urlRouterProvider) {
 $urlRouterProvider.otherwise('/login'); //Default route
 /**Varous routes based on state ,templateURL and controller is given */
 $stateProvider
  .state('login', {
   url: '/login',
   templateUrl: './login.html',
   controller: 'LoginController'
  })
  .state('home', {
   url: '/home',
   templateUrl: './home.html',
   controller: 'HomeController',
  })
  .state('home.edit', {
   url: "/patientsListEdit",
   templateUrl: "table-data.html",
   controller: "HomeController"
  })
  .state('home.add', {
   url: "/patientsListAdd",
   templateUrl: "table-data.html",
   controller: "HomeController"
  })
}]);
/**End og Route config */

/**Factory method to create ajaxFactory as service , to handle ajax calls */
app.factory('ajaxFactory', function($http) {
 var factory = {};
 factory.getCustomers = function() {
  return $http.get('/customer'); //Call to get all the Patients

 };

 factory.saveAll = function(data) {
  return $http.post('/saveDetails', data); //Call to save newly Added patient details
 }

 factory.showData = function(data) {
  factory.patientData = data; //Assigning value for further use
 }

 factory.getData = function() {
  console.log("Inside getData");
  return factory.patientData; //Return patient data
 }
 factory.getVisit = function(id) {
  console.log("Inside Visit")
  return $http.get('/visitDetails/' + id); //GET Call to return patient Visit data based on id passed
 }
 factory.saveVisit = function(data) {
  return $http.post('/addEditVisit', data); //POST call to edit visit against Patient selected
 }
 factory.addNewVisit = function(data) {
  return $http.post('/addVisit', data); //POST Call to add new Visit details to Patient
 }
 return factory; //return factory object
});


app.config(['$qProvider', function($qProvider) {
 $qProvider.errorOnUnhandledRejections(false);
}]);

/**Filter for handling pagination */
app.filter('startFrom', function() {
 return function(input, start) {
  start = +start; //parse to int
  return input.slice(start);
 }
});


/*End of Main JS file */