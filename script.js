

var wsUri = "ws://104.32.64.61:1234"; 
 var output, main; 
 var eotChar = "";
 var welcomed = false;
 var alertSound = new Audio('assets/msg.mp3');
var messageCount = 0;
 
 function user(id, name, color){
	 this.id = id;
	 this.name = name;
	 this.color = color;
 }
 
 
  function init() 
 { 
   $( "#loading" ).fadeOut(200);
collapsed = true;
 output = document.getElementById("mainchat"); 
 main = document.getElementById("maincontainer");
 startWebSocket(); 
$(window).bind('beforeunload', function(){
  return '';
});

userContainer = {};
 }

  function startWebSocket() 
 { 
  if (!window.WebSocket)
 {
	 window.alert("Your browser doesn't support websockets. Please use a different browser.");
 }
 websocket = new WebSocket(wsUri); 
 websocket.onopen = function(evt) { onOpen(evt) }; 
 websocket.onclose = function(evt) { onClose(evt) }; 
 websocket.onmessage = function(evt) { onMessage(evt) }; 
 websocket.onerror = function(evt) { onError(evt) }; 
 } 

  function onOpen(evt) 
 { 
 writeToScreen("Connected!"); 
 doSend('Connecting!');
 

 } 

  function onClose(evt) 
 { 
 writeToScreen("Disconnected!"); 
 } 

  function onMessage(evt) 
 { 
 var message = evt.data;
 if (message === " ")
 {
	//Ping response
	  doSend(" ");
	  return;
 }
 
handleMessage(message);
 
 if (message.indexOf("Welcome!") != -1 && message.indexOf("says") == -1)
	 welcomed = true;
 
 if (message.toLowerCase().indexOf("password") !== -1 && message.indexOf("says") === -1){
	 document.getElementById("text").type = "password";
 }


 } 
 
 
 function handleMessage(string){
	 /*
Handles message from the server and performs the proper action	 
	 
 Protocol:
 srvrmsg|text, For printing messages
 userlist|userID+name+color, For getting the list of users
 user|userID|leave/join|name|color, For getting a new user or a leaving user
 */ 
	var args = string.split(eotChar); 
	var id;
	if (args.length <= 0)
	{
		console.log("Malformed packet (too small)");
		return;
		
	}
	
	var type = args[0].toLowerCase();
	if(args.length >= 1)
	id = args[1];
	
	if (type === "srvrmsg"){
		//Prints a message from the server
		
		if (args.length > 1)
			writeToScreen(args[1]);
		return;
	}
	if (type === "userlist" && args.length === 2){
		// Takes userlist from server and adds it to lists and memory
		
		
		var userArray = args[1].split("|");
		var userInfo = [];
		for (var i = 0; i < userArray.length; i++)
		{
			userInfo=userArray[i].split("+");
			if (userInfo.length === 3)
			{
			var newUser = new user(userInfo[0],userInfo[1],userInfo[2]);
			userContainer[userInfo[0]] = newUser;
			var listItem = document.createElement('li');
			listItem.id = "userlist"+userInfo[0];
			listItem.innerHTML = userInfo[1];
			listItem.style.color = userInfo[2];
			$("ul#userlist").append(listItem);
			}
		}
	}
		
	
	if (type === "user" && args.length > 1)
	{
		//Reads info on a user joining or leaving
		console.log(args.length);
		console.log(args[2]);
		if (args[2] === "leave" && args.length === 3){
			//Clear out a user
			if (userContainer.hasOwnProperty(id)){
				$('#userlist'+id).remove();
				delete userContainer[id];
			}
			return;
		}
		
		if (args[2] === "join" && args.length === 5){
			//Adds a new user
			if (!userContainer.hasOwnProperty(id)){
			var newUser = new user(args[1],args[3],args[4]);
			userContainer[args[1]] = newUser;
			var listItem = document.createElement('li');
			listItem.id = "userlist"+args[1];
			listItem.innerHTML = args[3];
			listItem.style.color = args[4];
			$("ul#userlist").append(listItem);
			}
			return;
		}
	}
	//Something went wrong...
	console.log("Malformed packet");
 }
 
  function onError(evt) 
 { 
 writeToScreen('Error:' + evt.data); 
 } 

 function collapse(){
	 
	 //Shows and hides the user list
	  if (collapsed)
	  {
	  $( "#secondchat" ).animate({
    width: "20%"
  }, 50, function() {
  });
	  $( "#mainchat" ).animate({
    width: "80%"
  }, 50, function() {
	scrollToBottom();
  });
		document.getElementById('secondchat').style.display = 'block';
		collapsed = false;
		$("#collapser").attr("src","rightarrow.png");
		return;
	  }
	  
	  $( "#secondchat" ).animate({
    width: "0%"
  }, 50, function() {
  });
	  $( "#mainchat" ).animate({
    width: "100%"
  }, 50, function() {
	  document.getElementById('secondchat').style.display = 'none';
	  scrollToBottom();
  });
  $("#collapser").attr("src","leftarrow.png");
  collapsed = true;
	  
	  
 }
 
  function doSend(message) 
 {  
 
 websocket.send(message); 
 } 

  function writeToScreen(message) 
 { 
 
 messageCount++;
 var pre = document.createElement("span"); 
 if (message.indexOf("says") !== -1)
 {
	message = timestamp() + " " + message;
	alertSound.volume = 0.05;
	alertSound.play();
	if (message.indexOf("www") !== -1 || message.indexOf("http") !== -1 && message.indexOf("<img") === -1){
		message = message.linkify();
	}
 }
else
{
	pre.style.textAlign = "center";
	pre.style.marginLeft = "auto";
	pre.style.marginRight = "auto";
}
  pre.innerHTML = message + "<br />"; 
 output.appendChild(pre);
	 scrollToBottom();

//Clear out old messages for performance
if (messageCount >= 500)
	{
	messageCount--;
	output.removeChild(output.childNodes[0]);
	}
 
 } 

  window.addEventListener("load", init, false); 

  function sendMessage() {
    var x, text;
    text = document.getElementById("text").value;
	
	if (text !== "")
	{
    doSend(text);
	document.getElementById("text").value = "";
	document.getElementById("text").type = "text";
	}
	
	if (text == "/disconnect")
	 websocket.close();

}

function sendColor(){
if (welcomed)
{
	text = document.getElementById("colorChanger").value;
	if (text.length == 7){
		doSend("/color " + text);
	}
}
}

function timestamp(){
	
var date = new Date();
var hours = date.getHours();
var minutes = date.getMinutes();
var seconds = date.getSeconds();
if (hours < 10)
	hours = "0" + hours;
if (minutes < 10)
	minutes = "0" + minutes;
if (seconds < 10)
	seconds = "0" + seconds;
	
return "("+hours+":"+minutes+":"+seconds+")";
	
}

function addSpan(str){
	return "<span>" + str + "</span>";
}

function centeredSpan(str){
	return "<span style=\"text-align:center;\">" + str + "</span>";

}

function centeredElement(str){
	return "<div style=\"text-align:center;\">" + str + "</div>";

}


function scrollToBottom(){
	main.scrollTop = main.scrollHeight;
	document.getElementById('mainchat').scrollTop = document.getElementById('mainchat').scrollHeight;
}

//From http://stackoverflow.com/questions/37684/how-to-replace-plain-urls-with-links
    String.prototype.linkify = function() {

        // http://, https://, ftp://
        var urlPattern = /\b(?:https?|ftp):\/\/[a-z0-9-+&@#\/%?=~_|!:,.;]*[a-z0-9-+&@#\/%=~_|]/gim;

        // www. sans http:// or https://
        var pseudoUrlPattern = /(^|[^\/])(www\.[\S]+(\b|$))/gim;

        // Email addresses *** here I've changed the expression ***
        var emailAddressPattern = /(([a-zA-Z0-9_\-\.]+)@[a-zA-Z_]+?(?:\.[a-zA-Z]{2,6}))+/gim;

        return this
            .replace(urlPattern, '<a target="_blank" href="$&">$&</a>')
            .replace(pseudoUrlPattern, '$1<a target="_blank" href="http://$2">$2</a>')
            .replace(emailAddressPattern, '<a target="_blank" href="mailto:$1">$1</a>');
    };

