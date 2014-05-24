$( function() {
  $("#winner").load("chunks/winner.html.chunk", function () {
    $("#winningOption").append(getWinner());
  });
});

function getWinner() {
  return "CHECK ONE TWO";
}

function ballot_to_schulze_vote(ballot) {
  
}

function schulze_vote_to_ballot(schulze_vote) {

}
