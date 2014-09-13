'use strict';

/******************************************************************************/
// Globals

var id = get_query_parameter( "id" );

/******************************************************************************/
// Main

$( function() {
  getPollData(getResults); // getResults calls renderWinner or renderEndTime
});

/******************************************************************************/

function getPollData(callback) {
  var pollRef = new Firebase("https://glowing-fire-9001.firebaseio.com/polls/" + id);

  var options = [];
  var votes = {};
  var endTime;
  var callbacksLeft = 4;

  var optionsRef = pollRef.child("options");
  optionsRef.on("value", function(snapshot) {
    options = snapshot.val();
    done();
  });

  var votesRef = pollRef.child("votes");
  votesRef.on("value", function(snapshot) {
    snapshot.forEach( function( vote ) {
      var name = decodeURIComponent( vote.name() );
      votes[name] = vote.val();
    });
    done();
  });

  var endTimeRef = pollRef.child("endTime");
  endTimeRef.on("value", function(snapshot) {
    endTime = snapshot.val();
    done();
  });

  var questionRef = pollRef.child("question");
  questionRef.on("value", function(snapshot) {
    $("#question").text(snapshot.val());
    done();
  });

  function done() {
    callbacksLeft -= 1;
    if( callbacksLeft == 0 ) {
      callback(null, options, votes, endTime);
    }
  }
}

/******************************************************************************/

function getResults(err, options, votes, endTime) {
  if( err ) {
    console.log("oh shit, " + err);
  }

  // If there's no end time or the end time is pased, tally up the results
  if( !endTime || endTime < (new Date().getTime()) )
  {
    var schulze = new Schulze();
    
    for( var i = 0; i < options.length; i++ ) {
      schulze.addOption(options[i]);
    }

    schulze.startVoting();

    var voters = Object.keys(votes);
    for(var i = 0; i < voters.length; i++ ) {
      if( !schulze.pushVote( votes[voters[i]] ) ) {
        console.log("Failed to add vote \"" + newVote + "\"");
        return "FAILD";
      }
    };

    var results = schulze.getResult().split('-');
    var resultsArr = [];
    for( var placeDex = 0; placeDex < results.length; placeDex++ ) {
      resultsArr[placeDex] = [];
      for( var optionDex = 0; optionDex < results[placeDex].length; optionDex++ ) {
      var c = results[placeDex].charAt(optionDex);
        resultsArr[placeDex].push(options[Vote.alphabet.indexOf(c)]);
      }
    }
    renderWinner(null, resultsArr);
  } else {
    renderEndTime(null, endTime);
  }

  renderVotes(null, options, votes);

  // If there's no end time or end time has not yet passed, offer to vote
  if( !endTime || endTime > (new Date().getTime()) )
  {
    renderVoteButton(null);
  }
}

/******************************************************************************/

function renderWinner( err, results ) {
  $("#resultbox").text("In first place:   ");
  $("#resultbox").append(results[0].join(", "));
}

/******************************************************************************/

function renderEndTime( err, endTime ) {
  $("#resultbox").text("The poll will end " + (new Date(endTime).toLocaleString()));
}

/******************************************************************************/

function renderVotes( err, options, votes ) {
  for( var i = 0; i < options.length; i++ ) {
    $("#votesHead th:last").after("<th>" + options[i] + "</th>");
  }
  var voters = Object.keys(votes);
  for( var i = 0; i < voters.length; i++ ) {
    $("#votesBody").append( ballotRowHTMLFromSchulzeBallot( voters[i], votes[voters[i]] ) );
  }
}

/******************************************************************************/

function renderVoteButton( err ) {
  var button = $("<button></button>");
  button.text("Go Vote");
  button.addClass("btn");
  button.addClass("btn-primary");
  button.addClass("pull-right");
  button.click(function() {
    window.location.href = "vote.html?id=" + id;
  });

  $("#voteButtonBox").append(button);
}

/******************************************************************************/

function ballotRowHTMLFromSchulzeBallot( voterName, schulzeBallot ) {
  var rowHTMLString = "";
  rowHTMLString += "<tr>";
  rowHTMLString += "<td>" + voterName + "</td>";
  var ballotMap = [];
  var place = 0;
  for( var resChar = 0; resChar < schulzeBallot.length; resChar++ ) {
    if( schulzeBallot.charAt(resChar) === "-" ) {
      place++;
      continue;
    }
    ballotMap[Vote.alphabet.indexOf(schulzeBallot.charAt(resChar))] = place + 1;
  }
  for( var i = 0; i < ballotMap.length; i++ ) {
    rowHTMLString +=  "<td>" + ballotMap[i] + "</td>";
  }
  rowHTMLString += "</tr>";
  return rowHTMLString;
}

