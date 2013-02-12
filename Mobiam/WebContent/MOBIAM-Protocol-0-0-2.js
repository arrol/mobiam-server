//-------------------------------
//  GFOS Innovationsaward 2013
//MOBIAM-Protkoll-Basisfunktionen
// (C) Niklas Weissner 2012/2013
//-------------------------------
//Protokoll-Version: 0.0.2 Test Version

//Webservice-Adressen
var SERVICE_HOST = "./test_service/";
var SERVICE_TYPE = ".php";

//Protokoll-Nachrichttypen
var MSGTYPE_SUCCESS = 0;
var MSGTYPE_ERROR = 10;
var MSGTYPE_XML = 20;
  
//Fehlercodes
var ERROR_NOERROR = -1;
var ERROR_FATAL = 0;
var ERROR_INFO = 10;
  
//Statische Variablen
var lastMessage;

//Kontaktiert einen Service und führt die übergebene success-Funktion(mit Message-Objekt als Parameter) bei Antwort 
//oder die error-Funtion bei Fehlschlag aus
function callService(service, parameter, callbackSuccess, callbackError)
{
	var adress = SERVICE_HOST + service + SERVICE_TYPE;
	$.ajax({
		type: "POST",
		url: adress,
		cache: false,
		timeout: 4000,
		success: function(data)
		{
			callbackSuccess($.parseJSON(data));
		},
		error: callbackError
	});
}

//Altes Protkollformat
/*//Decodiert eine empfangene Nachricht zu einem Message-Objekt
function decodeMessage(message)
{
	if(message.length < 1)
		return new Message(MSGTYPE_ERROR,"Invalid message");
	
	var parts = message.split(";");
	var type = parts[0];
	var data = "";
	
	for(var i = 1; i < parts.length; i++)
		data += parts[i] + ";";
	data = data.substr(0,data.length-1);
		
	var msg = new Message(type,data);
	return msg;
}

//Konstruktor für Message-Objekt
function Message(type, data)
{
	this.type = type;
	this.data = data;
	
	this.toString = function()
	{
		return this.type + ";" + this.data;
	}
	
	this.isErrorMessage = function()
	{
		return type == MSGTYPE_ERROR;
	}
	
	this.getErrorCode = function()
	{
		if(!this.isErrorMessage())
			return ERROR_NOERROR;
		
		var parts = data.split(";");
		return parts[0];
	}
	
	this.getErrorMessage = function()
	{
		if(!this.isErrorMessage())
			return "No error";
			
		var parts = data.split(";");
		return parts[1];
	}
	
	this.getDataPoint = function(index)
	{
		var parts = data.split(";");
		return parts[index];
	}
}*/