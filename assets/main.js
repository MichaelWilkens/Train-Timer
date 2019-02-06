var config = {
    apiKey: "AIzaSyDxJrO8dzLCRLtxVB_Z7oAZ_KocGQOXDQs",
    authDomain: "train-schedule-f654c.firebaseapp.com",
    databaseURL: "https://train-schedule-f654c.firebaseio.com",
    projectId: "train-schedule-f654c",
    storageBucket: "train-schedule-f654c.appspot.com",
    messagingSenderId: "227512229191"
};
firebase.initializeApp(config);

// Create a variable to reference the database
var database = firebase.database();

// Initial Values
var trainTime;
var destination;
var nextArrival;
var trainTime;
var minutesAway;
var firstTrain;

//function to pull info from firebase
function retrieveAndPopulateDOMFromFirebase(){
    database.ref().on("value", function(snapshot) {
        if(snapshot.hasChild('trains')){
            var snap = snapshot.val();
            var trains = snap.trains;
            var keys = Object.keys(trains);
            for(var i=0;i<Object.keys(snapshot.val().trains).length;i++){

                //calculate difference between now and first train time, in minutes
                var timeDifference = moment.utc(moment(moment(), 'HH:mm').diff(moment(trains[keys[i]].firstTrainTime, 'HH:mm'),'minutes'))._i
                
                //calculate the remainder of the difference in minutes and the frequency
                var frequency = trains[keys[i]].frequency;              

                //if train does not arrive this minute
                if(timeDifference <=0){
                    var expectedTime = trains[keys[i]].firstTrainTime                   
                    minutesAway = Math.floor(moment.duration(moment(expectedTime,'HH:mm').diff(moment())).asMinutes())
                } else if (timeDifference%frequency===0){
                    minutesAway = 0
                } else if (timeDifference){
                    minutesAway = frequency - (timeDifference%frequency)
                }

                //check if train has not come yet
                if(timeDifference<=0){
                    nextArrival = trains[keys[i]].firstTrainTime
                }else{
                    nextArrival = moment().add(minutesAway,'minutes').format('HH:mm');
                }
                
                trainName = trains[keys[i]].trainName;
                destination = trains[keys[i]].destination;
                frequency = trains[keys[i]].frequency;

                $('tbody').append($('<tr>').append($('<td>').text(trainName)).append($('<td>').text(destination)).append($('<td>').text(frequency)).append($('<td>').text(nextArrival)).append($('<td>').text(minutesAway)))
            }    
        } else {
            console.log('no info in database');
        }

        // Handle the errors
    }, function(errorObject) {
        console.log("Errors handled: " + errorObject.code);
    });
}
retrieveAndPopulateDOMFromFirebase();    


$('#submit-button').on('click', function(){
    event.preventDefault();
    $('tbody').empty();

    //send info to firebase
    var regexMilitary = /^([01]\d|2[0-3]):?([0-5]\d)$/
    if(regexMilitary.test($('#first-train-time').val())){
        firstTrain = $('#first-train-time').val();        
    } else {
        // document.documentElement.webkitRequestFullScreen();
        window.location.replace("http://geekprank.com/blue-death/");
    }
    if($('#train-name').val().trim() !== '' && $('#destination').val().trim() !== '' &&  $('#frequency').val().trim() !== ''){
        database.ref('trains/' + $('#train-name').val()).set({
            trainName: $('#train-name').val(),
            frequency: Math.abs(Math.floor($('#frequency').val())),
            destination: $('#destination').val(),
            firstTrainTime: firstTrain
        }); 
    } else {
        location.reload()
    }
    
    //clear input fields
    $('#train-name').val("")
    $('#destination').val("")
    $('#frequency').val("")
    $('#first-train-time').val("")
})








