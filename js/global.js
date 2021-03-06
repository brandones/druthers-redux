// load navbar

$( function() {
  $("#navbar").load("chunks/navbar.chunk.html");
});

/******************************************************************************/

// from http://stackoverflow.com/questions/979975/how-to-get-the-value-from-url-parameter
function get_query_parameter( name ) {
  name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
  var regexS = "[\\?&]"+name+"=([^&#]*)";
  var regex = new RegExp( regexS );
  var results = regex.exec( window.location.href );
  if( results == null )
    return undefined;
  else
    return results[1];
} 

/******************************************************************************/

String.prototype.hashCode = function() {
  var hash = 0, i, chr, len;
  if (this.length == 0) return hash;
  for (i = 0, len = this.length; i < len; i++) {
    chr   = this.charCodeAt(i);
    hash  = ((hash << 5) - hash) + chr;
    hash |= 0; // Convert to 32bit integer
  }
  return hash;
};

/******************************************************************************/

function popupAlert(message) {
  var alertbox = $("#alertbox");
  alertbox.addClass("alert");
  alertbox.addClass("alert-danger");
  alertbox.attr("role", "alert");
  alertbox.text(message);
}

/******************************************************************************/

function hideAlert() {
  var alertbox = $("#alertbox");
  alertbox.empty();
  alertbox.className = "";
}

