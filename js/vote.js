var id = get_query_parameter("id");

var pollRef = new Firebase("https://glowing-fire-9001.firebaseio.com/polls/" + id);

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
    }
  ],
  render
);

function render(err, results) {
  if (err) {
    console.log("oh shit, " + err);
  }
  var question = results[0];
  var questionNode = document.getElementById("question");
  questionNode.appendChild(document.createTextNode(question));
  
  var options = results[1];
  for( var i = 0; i < options.length; i++) {
    addOption(options[i], i);
  }
}

function addOption(option, optionIndex) {
  var optionsNode = document.getElementById("options");

  var optionFormGroup = document.createElement("div");
  optionFormGroup.className = "form-group";

  var optionDiv = document.createElement("div");
  optionDiv.className = "col-xs-offset-0 col-sm-offset-1 col-md-offset-1 col-lg-offset-1";

  var inputDiv = document.createElement("div");
  inputDiv.className = "input-group col-md-8";
  
  var optionInput = document.createElement("input");
  optionInput.name = Vote.alphabet[optionIndex];
  optionInput.type = "text";
  optionInput.className = "form-control ballot-option";

  var optionTextBox = document.createElement("span");
  optionTextBox.className = "input-group-addon";

  var optionText = document.createTextNode(option);

  optionTextBox.appendChild( optionText );
  inputDiv.appendChild( optionInput );
  inputDiv.appendChild( optionTextBox );
  optionDiv.appendChild( inputDiv );
  optionFormGroup.appendChild( optionDiv );
  optionsNode.appendChild( optionFormGroup );
}

function vote(form) {
  // parse form
  var encodedNickname = encodeURIComponent( form.nickname.value );
  var optionIndex = 0;
  var ballotArray = []
  for( var i = 0; i < form.elements.length; i++ ) {
    if( $(form.elements[i]).hasClass("ballot-option") ) {
      if( !(form.elements[i].value in ballotArray) ) {
        ballotArray[form.elements[i].value] = "";
      }
      ballotArray[form.elements[i].value] += form.elements[i].name;
    }
  }
  var ballotSchulze = "";

  var index = 0;
  ballotArray.forEach( function(element) {
    console.log(element);
    if( index != 0 ) {
      ballotSchulze += "-";
    }
    ballotSchulze += element;
    index++;
  });

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
