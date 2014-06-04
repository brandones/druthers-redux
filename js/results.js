$( function() {
  $("#winner").load("chunks/winner.html.chunk", function () {
    getPollData(getResults); // getResults calls renderWinner
  });
});

function getPollData(callback) {
  console.log( "getPollData called" );
  var id = get_query_parameter( "id" );
  var pollRef = new Firebase("https://glowing-fire-9001.firebaseio.com/polls/" + id);

  var options = [];
  var votes = {};
  var callbacksLeft = 2;
  console.log( "getPollData" );

  var optionsRef = pollRef.child("options");
  optionsRef.on("value", function(snapshot) {
    console.log( "optionsRef callback" );
    options = snapshot.val();
    done();
  });

  var votesRef = pollRef.child("votes");
  votesRef.on("value", function(snapshot) {
    console.log( "votesRef callback" );
    snapshot.forEach( function( vote ) {

      votes[vote.name()] = vote.val();
    });
    console.log(JSON.stringify(votes, undefined, 2));
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
  console.log("getResults called");
  console.log(options);
  console.log(JSON.stringify(votes, undefined, 2));
  if (err) {
    console.log("oh shit, " + err);
  }

  var schulze = new Schulze();
  
  for (var i = 0; i < options.length; i++) {
    schulze.addOption(options[i]);
  }

  schulze.startVoting();

  var voters = Object.keys(votes);
  for (var i = 0; i < voters.length; i++) {
    if (!schulze.pushVote(votes[voters[i]])) {
      console.log("Failed to add vote \"" + newVote + "\"");
      return "FAILD";
    }
  };

  var results = schulze.getResult().split('-');
  console.log("results:");
  console.log(results);
  var resultsArr = [];
  for( var placeDex = 0; placeDex < results.length; placeDex++ ) {
    resultsArr[placeDex] = [];
    for( var optionDex = 0; optionDex < results[placeDex].length; optionDex++ ) {
    var c = results[placeDex].charAt(optionDex);
      resultsArr[placeDex].push(options[Vote.alphabet.indexOf(c)]);
    }
  }
  console.log(resultsArr);
  render(null, resultsArr);
}

function render( err, results ) {
  $("#winningOption").append(results[0].join(", "));
}

