'use strict';

/******************************************************************************/
// Globals

var id = get_query_parameter("id");

var pollRef = new Firebase("https://glowing-fire-9001.firebaseio.com/polls/" + id);

/******************************************************************************/
// Main

$( function() {
  async.parallel([
      function(callback) {
        var questionRef = pollRef.child("question");
        questionRef.on("value", function(snapshot) {
          callback(null, snapshot.val());
        });
      },
      function(callback) {
        var optionsRef = pollRef.child("options");
        optionsRef.on("value", function(snapshot) {
          callback(null, snapshot.val());
        });
      },
      function(callback) {
        var endTimeRef = pollRef.child("endTime");
        endTimeRef.on("value", function(snapshot) {
          callback(null, snapshot.val());
        });
      }
    ],
    render
  );
});

/******************************************************************************/

function popupAlert(message) {
  $("#alertbox").addClass("alert");
  $("#alertbox").addClass("alert-danger");
  $("#alertbox").attr("role", "alert");
  $("#alertbox").text(message);
}

/******************************************************************************/

function render(err, results) {
  if (err) {
    console.log("oh shit, " + err);
  }
  var question = results[0];
  var questionNode = document.getElementById("question");
  questionNode.appendChild(document.createTextNode(question));

  var endTime = results[2];
  if( !endTime || endTime > (new Date().getTime()) )
  {
    renderVoteForm(results[1]);
  }
  else
  {
    popupAlert("The voting time for this poll has passed.");
  }
}

/******************************************************************************/

function renderVoteForm(options) {
  $( function() {
    $("#contentbox").load("chunks/voteform.chunk.html", function() {
      var optionList = $("<ul></ul>");
      optionList.attr("id", "optionList");
      optionList.addClass("list-group");
      $("#options").append(optionList);
      for( var i = 0; i < options.length; i++) {
        addOption(options[i], i);
      }
      $( "#optionList" ).sortable();
//      $( "#options" ).disableSelection();  not sure what this does
    });
  });
}

/******************************************************************************/

function addOption(option, optionIndex) {
  var optionNode = $("<li></li>");
  optionNode.addClass("list-group-item");
  optionNode.addClass("ballot-option");
  optionNode.attr("id", Vote.alphabet[optionIndex]);
  optionNode.text(option);

  $("#optionList").append(optionNode);
}

/******************************************************************************/
// A couple helper functions for vote(...)

// From T.J. Crowder on StackOverflow
// http://stackoverflow.com/questions/10834796/validate-that-a-string-is-a-positive-integer
function isValidInteger(str) {
  var n = ~~Number(str);
  return String(n) === str && n >= 0;
}

/******************************************************************************/

function vote(form) {
  // parse form
  var encodedNickname = encodeURIComponent( form.nickname.value );

  var ballotSchulze = $("#optionList").sortable("toArray").join("-");

  console.log( "ballotSchulze: " + ballotSchulze );

  // get id
  var id = get_query_parameter( "id" );

  // serialize to firebase
  var ballotRef = new Firebase("https://glowing-fire-9001.firebaseio.com/polls/"
      + id + "/votes/" + encodedNickname);
  ballotRef.set(ballotSchulze, function(err, results) {
    if( err ) {
      console.log("oh shit, " + error);
    } else {
      for( var i = 0; i < results.length; i++) {
        console.log(results[i]);
      }
      // redirect to poll results page
      window.location.href = "results.html?id=" + id;
    }
  });
}
