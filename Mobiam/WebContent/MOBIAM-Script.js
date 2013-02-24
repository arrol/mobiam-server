//-----------------------------
//  GFOS Innovationsaward 2013
//     MOBIAM Client 0.1
//(C) Niklas Weissner 2012/2013
//-----------------------------

//Konstante für Skriptvalidierung. Das HTML-Dokument des Clients enthält ein Skript das
//anhand diesen Wertes überprüft ob und welche Skriptversion vorhanden ist.
var CLIENT_VERSION = "0.1";

/**
 * Namespace für Konstanten
 */
var MOBIAMConstants = {};

MOBIAMConstants.SESSION_COOKIE_ID = "mobiam-51966-session";

//Nachrichtenkonstanten
MOBIAMConstants.MSG_TYPE_SUCCESS = "success";
MOBIAMConstants.MSG_TYPE_ERROR = "error";

//Fehlerkatalog
MOBIAMConstants.ERROR_COULD_NOT_LOGOUT = 10; //Service konnte client nicht ausloggen
MOBIAMConstants.ERROR_BAD_SERVICE_CALL = 100; // Fehlerhafter Serviceaufruf
MOBIAMConstants.ERROR_MISSING_FIELDS = 101; //Nicht ausgefüllte Felder (z.B: Loginmaske)
MOBIAMConstants.ERROR_INVALID_SESSION = 102; //Ungültige Sitzungs-ID
MOBIAMConstants.ERROR_BAD_LOGIN_DATA = 210; //Fehlerhafte Logindaten

//Verbindungskonstanten
MOBIAMConstants.SERVICE_HOST = "./REST/WebService/";//Hier eventuell mit JSP Servicadresse einsetzen
MOBIAMConstants.SERVICE_POSTFIX = "/";

// GUI-Konstanten
MOBIAMConstants.UI_ICON_ATTENDANT_TRUE = "./img/green_icon.png";
MOBIAMConstants.UI_ICON_ATTENDANT_CAUSE = "./img/yellow_icon.png";
MOBIAMConstants.UI_ICON_ATTENDANT_FALSE = "./img/red_icon.png";

var timeLeft = 0; // Zeit, die die Sitzung noch gültig bleibt. (Lebenszeit des Session-Cookies)
var refreshRate = 15; // Zeit in Sekunden zwischen refresh-Vorgängen
var refreshTicks = 0; // Tick-Counter für den Refresh-Timer
var currentSession; // Aktuelle Sitzung
var attendanceData; // Aktuelle Anwesenheitsdatan (Objektarray)
var loginData; // Aktuelle Logindaten

$(document).ready(function()
{
	// Überprüfe auf noch gültigen Login
	var sessionCookie = ConManager.getCookie(MOBIAMConstants.SESSION_COOKIE_ID);
	if (sessionCookie != null)
	{
		// Versuchen, Sitzung wiederherzustellen
		refreshSession(sessionCookie);
	} else
	{
		// Keine Sitzungswiederherstellung
		showLoginForm();
	}

	//Event bei Scrollen der Seite
	$(window).bind('scroll', function()
	{
		updateDynamicFilterBar();
	});
});

/**
 * Erneuert die Anzeige der dynamischen Suchleiste. Die Suchleiste wird immer im Bild gehalten.
 * Wenn sie aus dem Bild gescrollt wird, ändert sich ihre Positionierung an den oberen Bildschirmrand.
 * Dies wird durch einen unsichtbaren Platzhalter erreicht, der den Container steuert, den jQuery für
 * die Filterleiste verwendet.
 */
function updateDynamicFilterBar()
{
	//Wenn Suchleiste nicht im Blickfeld -> fixierte Position am oberen Bilschrimrand,
	//ansonsten normale Position im Dokument
	if(!UIHelper.isInViewport("#dynamicFilterMarker"))
	{
		$("#dynamicFilter").attr("class", "MOBIAM_dynamic_list_filter");
	} else
	{
		$("#dynamicFilter").attr("class", "");
	}
}

/**
 * Versucht eine Sitzung zu erneuern. Wenn Service Erfolg meldet, wird die neue
 * Lebenszeit übernommen und die Sitzungsnummer auf das Echo-Feld gesetzt (für den Fall
 * einer Änderung der ID). Nach erfolgreicher Wiederherstellung wird die
 * Datenansicht angezeigt. Anderenfalls wird zur Loginseite gewechselt.
 * 
 * @param id Die ID der Sitzung die wiederhergestellt werden soll
 */
function refreshSession(id)
{
	var params =
	{
		sessionID : id
	};

	ConManager.callService("keepalive", params, function(recvMsg)
	{
		if (recvMsg.type == MOBIAMConstants.MSG_TYPE_SUCCESS)
		{
			refreshRate = recvMsg.refreshRate;
			timeLeft = recvMsg.timeLeft;
			currentSession = recvMsg.sessionID;
			ConManager.setCookie(MOBIAMConstants.SESSION_COOKIE_ID, recvMsg.sessionID, timeLeft);
			showDataView();
		} else if (recvMsg.type == MOBIAMConstants.MSG_TYPE_ERROR)
		{
			if (recvMsg.errorId == MOBIAMConstants.ERROR_INVALID_SESSION)
			{
				showLoginForm();
			}
		}
	});
}

/**
 * Ruft die Identifikationsmethode auf um eine Wilkommensnachricht anzuzeigen.
 * Bei Fehlern oder fehlenden Informationen wird auf die Wilkommensnachricht
 * verzichtet.
 */
function refreshUserIdent()
{
	var params =
	{
		sessionID : currentSession
	};
	ConManager.callService("identifyMe", params, function(data)
	{
		if(data.type == MOBIAMConstants.MSG_TYPE_SUCCESS)
		{
			$("#welcomeMessage").html(
					"<h1>Willkommen, " + data.name + ".</h1>"
							+ "<p>Sie sind angemeldet im Werk " + data.office
							+ "</p>");
		}else
		{
			//Fehler: Nur einfachen Gruß anzeigen.
			$("#welcomeMessage").html("<h1>Willkommen!</h1>");
		}
	});
}

/**
 * Ruft die Listmethode auf und lädt die Liste mit neuen Anwesenheitsdaten
 */
function refreshDataList()
{
	var params =
	{
		sessionID : currentSession,
		filter : ""
	};
	ConManager.callService("list", params, function(data)
	{
		if (data.type == MOBIAMConstants.MSG_TYPE_SUCCESS)
		{
			//Cookie-Lebenszeit erneuern
			timeLeft = data.timeLeft;
			ConManager.setCookie(MOBIAMConstants.SESSION_COOKIE_ID, currentSession, timeLeft);
			
			attendanceData = data.data;
			loadDataList(data.data);
		}
	});
}

/**
 * Entleert die Anwesenheitsliste und veranlasst die GUI die leere Liste
 * zu übernehmen.
 */
function clearDataList()
{
	var listView = $("#dataList");
	listView.html("");
	listView.listview("refresh");
}

/**
 * Erneuert die Anwesenheitsliste mit Anwesenheitsdaten im Objektformat des
 * Services. Die Anwesenheitsliste wird als Objektarray übergeben.
 * Die Spezifikation 0.0.3 des MOBIAM-Protokolls sieht folgenden 
 * Aufbau der Objekte vor:
 * 
 * 	{
 * 		int id;				//Identifikationsnummer
 * 		String name;		//Name der Person
 * 		boolean attendance; //Anwesenheit
 * 		String cause;		//Begründung für Abwesenheit(nur bei !attendance Pflicht)
 *  }
 *  
 * @param data Ein Array mit Anwesenheitsdaten im oben beschriebenen Format
 */
function loadDataList(data)
{
	// Einträge in der Datenliste sortieren, damit Einträge und Trenner korrekt
	// eingefügt werden
	var compareNameObject = function(a, b)
	{
		if (a.name < b.name)
			return -1;
		if (a.name > b.name)
			return 1;
		return 0;
	};
	data.sort(compareNameObject);

	var newListHtml = "";
	var listView = $("#dataList");
	listView.html("");

	for ( var i = 0; i < data.length; i++)
	{
		var pers = data[i];

		// HTML-Elemente der Einträge generieren
		newListHtml += "<li data-filtertext='" + pers.name + "'>";
		newListHtml += "<h3>" + pers.name + "</h3>";
		if (!pers.attendance && pers.cause != null)
			newListHtml += "<p>" + pers.cause + "</p>";
		newListHtml += "<img src='"//<p class='ui-li-aside'> width=32 height=32
				+ (pers.attendance ? MOBIAMConstants.UI_ICON_ATTENDANT_TRUE : (pers.cause == ""
						|| pers.cause == "undefined" ?MOBIAMConstants. UI_ICON_ATTENDANT_FALSE
						: MOBIAMConstants.UI_ICON_ATTENDANT_CAUSE))
				+ "' alt='"
				+ (pers.attendance ? "Anwesend" : (pers.cause == ""
						|| pers.cause == "undefined" ? "Nicht anwesend"
						: "Nicht anwesend (Begründet)")) + "'></img>";
		newListHtml += "</li>";
	}
	listView.html(newListHtml);
	listView.listview("refresh");
	listView.listview();
}

/**
 * Startet einen Loginvorgang. Stellt eine Loginanfrage an den Service.
 * Bei Erfolg wird eine Sitzung mit den Daten die vom Service 
 * erhalten wurden erstellt und die Datenansicht wird geöffnet.
 * Auf Fehler wird mit Anzeigen im Loginformular oder (bei fatalen Fehlern)
 * mit der Fehlerseite reagiert.
 */
function doLogin()
{
	var v_tenant = $("#tenant_input").val();
	var v_office = $("#office_input").val();
	var v_empid = $("#empid_input").val();
	var v_pass = $("#pass_input").val(); // Hier später Passwort-Hash generieren

	$("#pass_input").val("");// Passwortfeld zu Sicherheitszwecken leeren

	var loginData =
	{
		tenant : v_tenant,
		office : v_office,
		empid : v_empid,
		pass : v_pass
	};

	ConManager.callService(
			"login",
			loginData,
			function(recvMsg)
			{
				//Statuslabels leeren um alte Fehler nicht weiterhin mit anzuzeigen
				//wenn neue Fehler auftreten
				$("#tenant_statuslabel").html("");
				$("#office_statuslabel").html("");
				$("#empid_statuslabel").html("");
				$("#pass_statuslabel").html("");
				if (recvMsg.type == MOBIAMConstants.MSG_TYPE_SUCCESS)
				{
					// Logingerfolg -> Sitzungsnummer übernehmen, Logouttimer
					// setzen und zur Datenansicht wechseln
					timeLeft = recvMsg.timeLeft;
					refreshRate = recvMsg.refreshRate;
					currentSession = recvMsg.sessionID;
					ConManager.setCookie(MOBIAMConstants.SESSION_COOKIE_ID, recvMsg.sessionID, timeLeft);
					showDataView();
				} else if (recvMsg.type == MOBIAMConstants.MSG_TYPE_ERROR)
				{
					// Loginfehler
					if (recvMsg.errorID == MOBIAMConstants.ERROR_MISSING_FIELDS)
					{
						// Service meldet dass benötigte Felder leer gelassen wurden
						// Entsrepechend der Anforderungen des Services Hinweise setzen
						for ( var i = 0; i < recvMsg.missingData.length; i++)
							$("#" + recvMsg.missingData[i] + "_statuslabel")
									.html("<font color='#9E2020'>Dieses Feld muss ausgef&uuml;llt werden!</font>");
					} else if (recvMsg.errorID == MOBIAMConstants.ERROR_BAD_LOGIN_DATA)
					{
						// Service meldet ungültige Logindaten
						$("#pass_statuslabel")
								.html(
										"<font color='#9E2020'>Fehlerhafte Logindaten!</font>");
					}
				}
			});
}

/**
 * Leert alle Eingabefelder und Statuslabels des Loginformulars.
 */
function clearLoginForm()
{
	$("#tenant_statuslabel").html("");
	$("#office_statuslabel").html("");
	$("#empid_statuslabel").html("");
	$("#pass_statuslabel").html("");
	
	$("#tenant_input").val("");
	$("#office_input").val("");
	$("#empid_input").val("");
	$("#pass_input").val("");
}


/**
 * Startet einen Logoutvorgang. Stellt Logoutanfrage an den Service und
 * beendet danach die Sitzung(zeigt die Loginseite an). Alle Fehlermeldungen 
 * bis auf explizite Logoutfehler des Services werden ignoriert. 
 * Bsp: Eine ungültige SessionID muss nicht als Grund gesehen werden, die 
 * lokale Sitzung beizubehalten, da der Service die Sitzung sowieso als 
 * ungültig ansieht und eine Kommunikation so nicht mehr möglich ist.
 * 
 * Der Fehlercode ERROR_COULD_NOT_LOGOUT ist der einzige Fehler der hier
 * zu einem Abbruch führt.
 */
function doLogout()
{
	var params =
	{
		sessionID : currentSession
	};

	ConManager.callService(
			"logout",
			params,
			function(recvMsg)
			{
				if (recvMsg.type == MOBIAMConstants.MSG_TYPE_ERROR
						&& recvMsg.errorID == MOBIAMConstants.ERROR_COULD_NOT_LOGOUT)
				{
					// Alle Fehlermeldungen bis auf explizite Logoutfehler des
					// Services werden ignoriert.
					alert("Technischer Fehler: Logout fehlgeschlagen.\nVersuchen sie es später erneut und/oder kontaktieren\nsie ihren Systemadmin.");
					return;
				}
				// Kein expliziter Logoutfehler -> Logout kann lokal
				// durchgeführt werden
				clearDataList();
				ConManager.setCookie(MOBIAMConstants.SESSION_COOKIE_ID, currentSession, 0);
				showLoginForm();
			});
}

/**
 * Objekt für den refresh-Timer
 */
var refreshTimer = {};

/**
 * Startet den Logouttimer.
 */
refreshTimer.start = function()
{
	refreshTimer.id = setInterval(function()
	{
		refreshTimerTick();
	}, 1000);
};

/**
 * Stoppt den Logouttimer.
 */
refreshTimer.stop = function()
{
	clearInterval(refreshTimer.id);
};

/**
 * Tick-Funktion des Refresh-Timers. Wird bei jedem Takt des Timers aufgerufen.
 * Wenn die Tickzahl die Refresh-Rate erreicht wird diese zurückgesetzt und
 * die Anwesenheitsliste wird erneuert.
 */
function refreshTimerTick()
{
	//Refresh hat Priorität vor Auto-Logout
	if(++refreshTicks >= refreshRate)
	{
		refreshTicks = 0;
		refreshDataList();
		return;
	}
	
	if(--timeLeft <= 0)
	{
		doLogout();
	}
}

/**
 * Zeigt das Loginformular an und intitialisiert die Notification.
 * Stoppt zusätzlich den Refreshtimer um keine unnötigen Refreshs
 * zu verursachen. 
 */
function showLoginForm()
{
	refreshTimer.stop();
	UIHelper.showSubcontent("loginForm");
}

/**
 * Zeigt die Datenansichtseite an und intitialisiert die Datenliste,
 * die Wilkommensnachricht und den Refreshtimer.
 */
function showDataView()
{
	refreshTimer.start();
	refreshUserIdent();
	refreshDataList();
	UIHelper.showSubcontent("dataView");
}

/**
 * Zeigt die Fehlerseite mit der übergebenen Fehlernachricht an. Stoppt zusätzlich
 * alle aktiven Prozesse wie den Autorefresh.
 * 
 * @param errorMessage Die anzuzeigende Fehlernachricht.
 */
function showFatalErrorPage(errorMessage)
{
	refreshTimer.stop();
	UIHelper.showSubcontent("errorPage");
	$("#errorInfoLabel").html(errorMessage);
}

/**
 * Namespace für Interface-Hilfsklassen
 */
var UIHelper = {};

/**
 * Zeigt Header, Footer und Contents einer bestimmten Gruppe an und blendet alle anderen aus.
 * 
 * @param name Der Name der Contentgruppe
 */
UIHelper.showSubcontent = function(name)
{
	UIHelper.hideAllContent();

	$("#content_" + name).show();
	$("#header_" + name).show();
	$("#footer_" + name).show();
};

/**
 * Blendet alle Header, Footer und Contents aus.
 */
UIHelper.hideAllContent = function()
{
	$("div[data-role='header']").hide();
	$("div[data-role='content']").hide();
	$("div[data-role='footer']").hide();
};

/**
 * Überprüft ob sich Objekte eines Selektors im momentanen Sichtfeld des Browsers befinden.
 * 
 * @param elementId Selektor der zu überprüfenden Objekte
 * @returns {Boolean} true wenn Objekt im Sichtfeld ist, false wenn nicht
 */
UIHelper.isInViewport = function(elementId)
{
	var docViewTop = $(window).scrollTop();
	var docViewBottom = docViewTop + $(window).height();

	var elemTop = $(elementId).offset().top;
	var elemBottom = elemTop + $(elementId).height();

	return ((elemBottom <= docViewBottom) && (elemTop >= docViewTop));
};

/**
 * Namespace für verbindungsrelevante Funktionen etc.
 */
var ConManager = {};

/**
 * Ruft eine Webmethode des Services auf(mittels POST). Die Verbindung erfolg asynchron(AJAX).
 * Bei erfolgreicher Verbindung wird die Callback-Funktion aufgerufen. Ein gravierender
 * Verbindungsfehler zeigt die Fehlerseite des Clients an.
 * 
 * @param serviceName Name der aufzurufenden Methode
 * @param parameter Ein JS-Objekt mit allen Paramatern
 * @param serviceCallback Die Callback-Funktion 
 */
ConManager.callService = function (serviceName, parameter, serviceCallback)
{
	var adress = MOBIAMConstants.SERVICE_HOST + serviceName + MOBIAMConstants.SERVICE_POSTFIX ;
	$.ajax(
	{
		type: "post",
		url: adress,
		dataType: "json",
		data: parameter,
		success: 
			function(jsonOb)
			{
				if(jsonOb.type == "undefined" || jsonOb.type == null)
				{
					showFatalErrorPage(MOBIAMStrings.ERROR_MALFORMED_MESSAGE);
					return;
				}
				if(jsonOb.type == MOBIAMConstants.MSG_TYPE_ERROR &&
						jsonOb.errorID == MOBIAMConstants.ERROR_BAD_SERVICE_CALL)
				{
					showFatalErrorPage(MOBIAMStrings.ERROR_BAD_SERVICE_CALL);
				}
				serviceCallback(jsonOb);
			},
		error:
			function(jqXHR,textStatus,errorThrown)
			{
				showFatalErrorPage(MOBIAMStrings.ERROR_COMMUNICATION_ERROR + textStatus + "; " + errorThrown);
			}
	});
};

/**
 * Setz einen Cookie mit angegebenem Namen, Inhalt und einer bestimmten Lebenszeit.
 * Die Lebenszeit wird auf die Systemzeit addiert und bildet so das Verfallsdatum
 * des Cookies. Eine Lebenszeit = 0 kann verwendet werden um einen Cookie zu löschen.
 * Eine Lebenszeit von -1 verleiht einem Cookie unbegrenzte Gültigkeit.
 * 
 * @param name Der Name des zu setzenden Cookies
 * @param value Der zu setzende Inhalt
 * @param ttl Die Lebenszeit des Cookies in Sekunden
 */
ConManager.setCookie = function(name, value, ttl)
{
	var expires = new Date();
	if(ttl == -1)
		expires == null;
	else
		expires.setSeconds(expires.getSeconds() + ttl);
	
	var valueFormat = escape(value) + ((expires==null) ? "" : "; expires=" + expires.toUTCString());
	
	document.cookie = name + "=" + valueFormat;
};

/**
 * Gibt den Inhalt eines Cookies mit bestimmtem Namen zurück. Ein nicht
 * definierter Cookie resultiert im Rückgabewert null.
 * 
 * @param name Der Name des gewünschten Cookies
 * @returns Den Inhalt des Cookies oder null
 */
ConManager.getCookie = function(name)
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
};

/**
 * Namepsace für GUI-Nachrichten (Fehlermeldungen etc.)
 */
var MOBIAMStrings = {};

MOBIAMStrings.ERROR_COMMUNICATION_ERROR = "Kommunikationsfehler:<br>Der Service konnte nicht erreicht werden, ein interner Fehler ist aufgetreten<br>" +
		"oder die Antwort des Services war nicht im JSON-Format.<br>" +
		"Bitte kontaktieren sie ihren Systemadmin.<br>Fehlercode: ";

MOBIAMStrings.ERROR_MALFORMED_MESSAGE = "Kommunikationsfehler:<br>Der Service antwortete in einem nicht protokollkonformen Format.<br>" +
		"Dies könnte durch unpassende Client- oder Serviceversionen oder einen ungültigen Service verursacht worden sein.<br>" +
		"Bitte kontaktieren sie ihren Systemadmin.";

MOBIAMStrings.ERROR_BAD_SERVICE_CALL = "Kommunikationsfehler:<br>Der Service meldete einen ungültigen Aufruf.<br>" +
		"Dies wird in der Regel durch eine unpassende Clientversion verursacht.<br>" +
		"Bitte kontaktieren sie ihren Systemadmin.";

