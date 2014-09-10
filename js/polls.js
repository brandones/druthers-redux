$( function() {
  getPolls();
});

function getPolls() {
  var pollsRef = new Firebase("https://glowing-fire-9001.firebaseio.com/polls");
  var polls = [];
  pollsRef.on("value", function( pollsSnapshot ) {
    var pollCount = pollsSnapshot.numChildren();
    var numDone = 0;
    pollsSnapshot.forEach( function( poll ) {
      var questionRef = poll.ref().child("question");
      questionRef.on("value", function(questionSnapshot) {
        var createdAtRef = poll.ref().child("createdAt");
        createdAtRef.on("value", function(createdAtSnapshot) {
          polls.push(
            {
              "id": poll.name(),
              "question": questionSnapshot.val(),
              "created": (new Date(createdAtSnapshot.val())).toString()
            }
          );
          numDone++;
          if( numDone === pollCount ) {
            for( var i = 0; i < polls.length; i++ ) {
              var rowString = ""
              rowString += "<tr id=\"row-" + polls[i].id + "\">";
              rowString += "<td><a href=\"results.html?id=" + polls[i].id + "\">" + polls[i].id + "</a></td>";
              rowString += "<td>" + polls[i].question + "</td>";
              rowString += "<td>" + polls[i].created + "</td>";
              rowString += "<td>";
              rowString += "<button id=\"" + polls[i].id + "\" type=\"button\" class=\"btn btn-default btn-xs remove\">";
              rowString += "<span class=\"glyphicon glyphicon-remove\"></span>";
              rowString += "</button>";
              rowString += "</td>";
              rowString += "</tr>";
              $("#pollsBody").append(rowString);
            }
            addButtonListener();
          }
        });
      });
    });
  });
}

function addButtonListener() {
  $(".remove").click( function() {
    var id = this.id;
    var pollRef = new Firebase("https://glowing-fire-9001.firebaseio.com/polls/" + id);
    pollRef.remove( function(err) {
      if( err ) {
        console.log( "oh shit: " + err );
      }
      location.reload(true);
    });
  });
}
