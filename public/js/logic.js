$(document).ready(function() {
    // Initialize Firebase
    var config = {
        apiKey: "AIzaSyCFq-IZOOpNt317VWEbDEXv0xrYn4ETEyo",
        authDomain: "rideit-a70cc.firebaseapp.com",
        databaseURL: "https://rideit-a70cc.firebaseio.com",
        storageBucket: "rideit-a70cc.appspot.com",
    };
    firebase.initializeApp(config);

    var database = firebase.database();

    // FIREBASE AUTHENTICATION ////////////////////////////////////////    //User Authentication - GitHub provider
    var provider = new firebase.auth.GithubAuthProvider();

    // Sign in redirect
    $("#sign-in").on("click", function() {
        firebase.auth().signInWithRedirect(provider);
    });
    // Get redirect result
    firebase.auth().getRedirectResult().then(function(result) {
        if (result.credential) {
            // This gives you a GitHub Access Token. You can use it to access the GitHub API.
            var token = result.credential.accessToken;
            // ...
        }
        // The signed-in user info.
        var user = result.user;
    }).catch(function(error) {
        // Handle Errors here.
        var errorCode = error.code;
        var errorMessage = error.message;
        // The email of the user's account used.
        var email = error.email;
        // The firebase.auth.AuthCredential type that was used.
        var credential = error.credential;
        // ...
    });
    // Get current user
    firebase.auth().onAuthStateChanged(function(user) {
        if (user) {
            // User is signed in.
            console.log(user);
            $('#sign-in').hide();
            $('#signed-in').show();
            $('#user').html(user.displayName);
        } else {
            // No user is signed in.
            $('#signed-in').hide();
            $('#sign-in').show();
        }
    });
    // Sign out
    $('#sign-out').on('click', function() {
        firebase.auth().signOut().then(function() {
            // Sign-out successful.
        }, function(error) {
            // An error happened.
        });
    });

    // MAIN LOGIC ///////////////////////////////////////////////////////
    // Choo Choo Time
    var audio = new Audio('aud/ride-it.mp3');

    $("#choochoo").on("click", function() {
        if (audio.paused) audio.play();
        else {
            audio.pause();
            audio.currentTime = 0;
        }
        console.log('Choo Choo');
    });

    // Schedule date for current day
    var scheduleDay = moment().format("dddd, Do MMMM YYYY");
    $('#schedule').html('Schedule for ' + scheduleDay);

    // Link for adding Trains
    $('#addTrain').on("click", function() {
        $("#addModal").modal();
    });

    // Submit new Train
    $("#addTrainBtn").on("click", function() {

        // Grabs user input
        var trainName = $("#trainName").val().trim();
        var trainDestination = $("#trainDestination").val().trim();
        var firstTime = moment($("#firstTime").val().trim(), "HH:mm").format("LT");
        var trainFrequency = $("#trainFrequency").val().trim();

        // Creates local "temporary" object for holding train data
        var newTrain = {
            name: trainName,
            destination: trainDestination,
            start: firstTime,
            frequency: trainFrequency
        };

        // Uploads train data to the database
        database.ref().push(newTrain);

        // Logs everything to console
        // console.log(newTrain.name);
        // console.log(newTrain.destination);
        // console.log(newTrain.start);
        // console.log(newTrain.frequency);

        // Confirm Add Train Modal
        $("#subModal").modal();

        // Clears all of the text-boxes
        $("#trainName").val("");
        $("#trainDestination").val("");
        $("#firstTime").val("");
        $("#trainFrequency").val("");

        // Prevents moving to new page
        return false;
    });


    // Creates Firebase event for adding train to the database and a row in the html when a user adds an entry
    database.ref().on("child_added", function(childSnapshot, prevChildKey) {

        // console.log(childSnapshot.val());

        // Store everything into a variable.
        var trainName = childSnapshot.val().name;
        var trainDestination = childSnapshot.val().destination;
        var firstTime = childSnapshot.val().start;
        var trainFrequency = childSnapshot.val().frequency;

        // Train Info
        // console.log('Train Name: ' + trainName);
        // console.log('Destination: ' + trainDestination);
        // console.log('First Arrival: ' + firstTime);
        // console.log('Arrival Frequency: ' + trainFrequency);
        // console.log('--------------------------------------');

        // First Time (pushed back 1 year to make sure it comes before current time)
        var firstTimeConverted = moment(firstTime, "HH:mm").subtract(1, "years");
        // Current Time
        var currentTime = moment();
        // console.log("CURRENT TIME: " + moment(currentTime).format("hh:mm"));
        // Difference between the times
        var diffTime = moment().diff(moment(firstTimeConverted), "minutes");
        // console.log("DIFFERENCE IN TIME: " + diffTime);
        // Time apart (remainder)
        var trainRemainder = diffTime % trainFrequency;
        // console.log(trainRemainder);
        // Minute Until Next Train
        var minutesAway = trainFrequency - trainRemainder;
        // console.log("MINUTES TILL TRAIN: " + minutesAway);
        // Next Train
        var nextArrival = moment().add(minutesAway, "minutes").format('LT');
        // console.log("ARRIVAL TIME: " + nextArrival);

        // Add each train's data into the table
        $("#trainTable > tbody").append("<tr><td>" + trainName + "</td><td>" + trainDestination + "</td><td>" + trainFrequency + "</td><td>" + nextArrival + "</td><td>" + minutesAway + "</td></tr>");

        // console.log('//////////////////////////////////////////////');

        // Handle the errors
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });
});
