'use strict';

/******************************************************************************/
// Main

$( function() {
  addLine();

  var moreButton = document.getElementById( "more" );
  moreButton.onclick = addLine;

  $('#datetimepicker').datetimepicker();
});

/******************************************************************************/

function addLine() {

  var optionFormGroup = document.createElement("div");
  optionFormGroup.className = "form-group";

  var optionLabel = document.createElement("label");
  optionLabel.className = "col-md-2 control-label";
  optionLabel["for"] = "option";

  var optionDiv = document.createElement("div");
  optionDiv.className = "col-md-6";
  
  var optionInput = document.createElement("input");
  optionInput.id = "option";
  optionInput.name = "option";
  optionInput.type = "text";
  optionInput.className = "form-control input-md";

  var optionsNode = document.getElementById("options");
  optionDiv.appendChild( optionInput );
  optionFormGroup.appendChild( optionLabel );
  optionFormGroup.appendChild( optionDiv );
  optionsNode.appendChild( optionFormGroup );

}

/******************************************************************************/

function create(form) {
  hideAlert();

  // parse form
  var question = form.question.value;
  var options = []
  for (var i = 0; i < form.elements.length; i++) {
    if (form.elements[i].id == "option") {
      if (/\S/.test(form.elements[i].value)) {
        options.push(form.elements[i].value);
      }
    }
  }

  // Get end time
  var endtime = undefined;
  if( form.endtime.value.trim() != "" ) {
    endtime = new Date(form.endtime.value).getTime();
  }
  if( isNaN(endtime) && endtime != undefined ) {
    popupAlert("Invalid date entry.");
    return;
  }

  // create poll id
  var id = makeid();

  // serialize to firebase
  var pollRef = new Firebase("https://glowing-fire-9001.firebaseio.com/polls/" + id);
  async.parallel([
      function(callback) { 
        pollRef.child("question").set(question, callback);
      },
      function(callback) {
        pollRef.child("options").set(options, callback);
      },
      function(callback) {
        pollRef.child("votes").set([], callback);
      },
      function(callback) {
        pollRef.child("createdAt").set(new Date().getTime(), callback);
      },
      function(callback) {
        if( endtime ) {
          pollRef.child("endTime").set(endtime, callback);
        } else {
          callback();
        }
      }
    ],
    function(err, results) {
      if( err ) {
        console.log("oh shit, " + error);
      } else {
        // redirect to poll vote page
        window.location.href = "results.html?id=" + id;
      }
    }
  );
}

/******************************************************************************/

// from http://stackoverflow.com/questions/1349404/generate-a-string-of-5-random-characters-in-javascript
function makeid() {
  var text = "";
  var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

  for( var i=0; i < 5; i++ )
    text += possible.charAt(Math.floor(Math.random() * possible.length));

  return text;
}
