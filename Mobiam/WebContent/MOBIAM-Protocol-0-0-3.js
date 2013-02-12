//-------------------------------
//  GFOS Innovationsaward 2013
//MOBIAM-Protkoll-Basisfunktionen
// (C) Niklas Weissner 2012/2013
//-------------------------------
//Protokoll-Version: 0.0.3 Test Version

//Konstanten
var PROTOCOL_VERSION = "0.0.3";

var SESSION_COOKIE_ID = "mobiam-51966-session";

//Fehlerkatalog
var ERROR_COULD_NOT_LOGOUT = 10; //Service konnte client nicht ausloggen
var ERROR_MISSING_FIELDS = 101; //Nicht ausgefüllte Felder (z.B: Loginmaske)
var ERROR_INVALID_SESSION = 102; //Ungültige Sitzungs-ID
var ERROR_BAD_LOGIN_DATA = 210; //Fehlerhafte Logindaten

//Verbindungskonstanten
var SERVICE_HOST = "./test_service/";//Hier eventuell mit JSP Servicadresse einsetzen
var SERVICE_POSTFIX = ".php";

//Nachrichtenkonstanten
var MSG_TYPE_SUCCESS = "success";
var MSG_TYPE_ERROR = "error";

//Ruft einen Service anhand seiner Bezeichnung auf und führt bei Erfolg die serviceCallback-Funktion mit Nachricht als Paramter aus
function callService(serviceName, parameter, serviceCallback)
{
	var adress = SERVICE_HOST + serviceName + SERVICE_POSTFIX;
	$.ajax(
	{
		type: "post",
		url: "localhost:8080/Mobiam/REST/WebService/Clientrequest",
		dataType: "json",
		data: parameter,
		success: 
			function(jsonOb)
			{
				serviceCallback(jsonOb);
			},
		error:
			function(jqXHR,textStatus,errorThrown)
			{
				alert("Error! (" + textStatus + ": " + errorThrown + ")");
			}
	});
}

//Setzt einen Cookie mit dem Namen name und dem Wert value
//ttl gibt die Gültigkeitsdauer des Cookies in Sekunden an
function setCookie(name, value, ttl)
{
	var expires = new Date();
	if(ttl == -1)
		expires == null;
	else
		expires.setSeconds(expires.getSeconds() + ttl);
	
	var valueFormat = escape(value) + ((expires==null) ? "" : "; expires=" + expires.toUTCString());
	
	document.cookie = name + "=" + valueFormat;
}

//Gibt den Cookie name zurück, wenn dieser definiert ist. Ansonsten null
function getCookie(name)
{
	var i, x, y;
	var ARRcookies = document.cookie.split(";");
	
	for (i = 0; i<ARRcookies.length; i++)
	{
		x = ARRcookies[i].substr(0,ARRcookies[i].indexOf("="));
		y = ARRcookies[i].substr(ARRcookies[i].indexOf("=")+1);
		x = x.replace(/^\s+|\s+$/g,"");
		if (x == name)
			return unescape(y);
	}
}