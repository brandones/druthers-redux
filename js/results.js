var id = get_query_parameter( "id" );

$( function() {
  $("#winner").load("chunks/winner.html.chunk", function () {
    getPollData(getResults); // getResults calls renderWinner
  });

  var voteButton = $("#voteButton");
  voteButton.click(function() {
    window.location.href = "vote.html?id=" + id;
  });
});


function getPollData(callback) {
  var pollRef = new Firebase("https://glowing-fire-9001.firebaseio.com/polls/" + id);

  var options = [];
  var votes = {};
  var callbacksLeft = 2;

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

  function done() {
    callbacksLeft -= 1;
    if( callbacksLeft == 0 ) {
      callback(null, options, votes);
    }
  }
}


function getResults(err, options, votes) {
  if( err ) {
    console.log("oh shit, " + err);
  }

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
  renderVotes(null, options, votes);
}


function renderWinner( err, results ) {
  $("#winningOption").append(results[0].join(", "));
}


function renderVotes( err, options, votes ) {
  for( var i = 0; i < options.length; i++ ) {
    $("#votesHead th:last").after("<th>" + options[i] + "</th>");
  }
  var voters = Object.keys(votes);
  for( var i = 0; i < voters.length; i++ ) {
    $("#votesBody").append( ballotRowHTMLFromSchulzeBallot( voters[i], votes[voters[i]] ) );
  }
}


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

