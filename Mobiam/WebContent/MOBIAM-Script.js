//-----------------------------
//  GFOS Innovationsaward 2013
//     MOBIAM Client 1.0
//(C) Niklas Weissner 2012/2013
//-----------------------------

//-------Copyright-Informationen-------
//Die Datei /img/error.png stammt aus der Open Icon Library
//Ursprüngliche Quelle: http://openiconlibrary.sourceforge.net/gallery2/?./Icons/actions/dialog-close-2.png
//
//Sämtliche anderen Icons im Verzeichnis /img/* wurden von Dennis Szczesny
//im Rahmen des Projektes erstellt.
//
//Die Bibliotheken jQuery und jQuery Mobile sind Eigentum der jQuery Foundation

//Konstante für Skriptvalidierung.
CLIENT_VERSION = "1.0";

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
MOBIAMConstants.SERVICE_CONNECTION_TIMEOUT = 2500; // 2,5 Sekunden Timeout

// GUI-Konstanten
MOBIAMConstants.UI_ICON_ATTENDANT_TRUE = "./img/green_icon.png";
MOBIAMConstants.UI_ICON_ATTENDANT_CAUSE = "./img/yellow_icon.png";
MOBIAMConstants.UI_ICON_ATTENDANT_FALSE = "./img/red_icon.png";

var timeLeft = 0; // Zeit, die die Sitzung noch gültig bleibt. (Lebenszeit des Session-Cookies)
var refreshRate = 15; // Zeit in Sekunden zwischen refresh-Vorgängen
var refreshTicks = 0; // Tick-Counter für den Refresh-Timer
var currentSession; // Aktuelle Sitzung
var attendanceData = null; // Aktuelle Anwesenheitsdatan (Objektarray)
var loginData; // Aktuelle Logindaten

$(document).ready(function()
{
	initEvents();
	
	initListview();
	
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
});

function initEvents()
{
	//Event bei Scrollen der Seite für dynamische Suchleiste
	$(window).bind('scroll', function()
	{
		//Position der dynamischen Suchleiste aktualisieren
		updateDynamicFilterBar();
	});
	
	//Loginformular
	$("#clearFormBtt").click(clearLoginForm());
}

/**
 * Initialisiert die Anwesenheitsliste. Erstellt den Filter. Definiert Events für
 * Suchfunktion etc.
 */
function initListview()
{	
	//Neue, eigenständige Suchleiste, da interne Suche von jQuery Mobile keine
	//Möglichkeit bietet, den Filter nach einem Refresh neu anzuwenden.
	//Erstellen von neuen Formularelementen und einer Suchleiste die vor die Liste
	//eingefügt wurden. Verfahren entspricht dem vom Jquery Mobile bei der
	//ertellung einer Filtereingabe
	var wrapper = $( "<form>", 
			{
				"class": "ui-listview-filter ui-bar-d",
				"role": "search"
			});
	
	var filterInput = $( "<input>", 
			{
				placeholder: "Suche Personen..."
			});
	
	filterInput.attr( "data-" + $.mobile.ns + "type", "search" );
	filterInput.attr( "id", "filterInput" );
	filterInput.jqmData( "lastval", "" );
	//->Nach Änderung des Filterstrings
	filterInput.bind( "keyup change input", 
			function()
			{
				//Wenn bereits einmal Daten abgerufen
				if(attendanceData != null)
				{
					//Abgerufene Liste erneuern und neuen Filter anwenden
					var filter = $("#filterInput").val();
					loadDataList(attendanceData,filter);
				}
			});
	filterInput.appendTo(wrapper);
	filterInput.textinput();
	
	wrapper.insertBefore("#dataList");
}

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
			//Erfolg. Sitzung kann weriter verwendet werden.
			refreshRate = recvMsg.refreshRate;
			timeLeft = recvMsg.timeLeft;
			//Service kann Sitzungs-ID bei Bedarf ändern. Neu ID übernehmen
			currentSession = recvMsg.sessionID;
			ConManager.setCookie(MOBIAMConstants.SESSION_COOKIE_ID, recvMsg.sessionID, timeLeft);
			showDataView();
		} else if (recvMsg.type == MOBIAMConstants.MSG_TYPE_ERROR)
		{
			//Fehler: Sitzung ist ungültig. User muss sich neu einloggen
			showLoginForm();
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
			//Gruß aufbauen
			$("#welcomeMessage").html(
					"<h1>Willkommen, " + data.name + ".</h1>"
							+ "<p>Sie sind angemeldet im Werk " + data.office
							+ "</p>");
		}else if (data.type == MOBIAMConstants.MSG_TYPE_ERROR)
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
			var filter = $("#filterInput").val();
			loadDataList(data.data,filter);
		}else if(data.type == MOBIAMConstants.MSG_TYPE_ERROR)
		{
			if(data.errorID == MOBIAMConstants.ERROR_INVALID_SESSION)
			{
				//Sitzung ungültig, Client muss augeloggt werden.
				alert(MOBIAMStrings.ERROR_LOGOUT_CAUSE_BADSESSION);
				doLogout();
			}
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
 *  Zusätzlich kann ein Filterstring übergeben werden. Dieser muss im Namen einer
 *  Person vorkommen damit die Person in die Liste aufgenommen wird. Wenn nicht
 *  gefiltert werden soll muss ein Leerstring, null oder undefined übergeben werden.
 *  
 * @param data Ein Array mit Anwesenheitsdaten im oben beschriebenen Format
 * @param filter Der Filterstring
 */
function loadDataList(data, filter)
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

		//Wenn vorhanden->Filter anwenden
		if(filter != null && filter != "undefined" && filter != "")
		{
			//Nur im Namen suchen, Groß- und Kleinschreibung missachten
			if(pers.name.toLowerCase().indexOf(filter.toLowerCase()) === -1)
				continue;
		}
		
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
	//neue Liste übernehmen und Liste erneuern
	listView.html(newListHtml);
	listView.listview("refresh");
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
	var v_pass = SHA256.getHash($("#pass_input").val());//Passwort-Hash generieren

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
					alert(MOBIAMStrings.ERROR_LOGOUT_FAILED);
					return;
				}
				// Kein expliziter Logoutfehler -> Logout kann lokal
				// durchgeführt werden
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
	}, 1000);//Festes Intervall: 1 Sekunde
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
		
		//Vor dem Aktualisieren Ladeindikator deaktivieren (störendes Blinken wegen häufigerem Aufruf)
		var llI = ConManager.showLoadIndicator;
		ConManager.showLoadIndicator = false;
		refreshDataList();
		ConManager.showLoadIndicator = llI;
		
		return;
	}
	
	//Wenn Refresh erst nach Ablauf einer Sitzung stattfinden würde:
	//Automatisch Ausloggen um Fehlern entgegenzuwirken
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
	clearDataList();//Aus Sicherheitsgründen alte Liste löschen
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
 * Flag zum deaktivieren des Ladeinikators beim Aufruf einer Methode
 */
ConManager.showLoadIndicator = true;

/**
 * Ruft eine Webmethode des Services auf(mittels POST). Die Verbindung erfolg asynchron(AJAX).
 * Bei erfolgreicher Verbindung wird die Callback-Funktion aufgerufen. Ein gravierender
 * Verbindungsfehler zeigt die Fehlerseite des Clients an. Diese Funktion zeigt automatisch
 * den Ladeindikator von jQuery mobile an und versteckt diesen wieder sobald der Service
 * geantwortet hat.
 * 
 * @param serviceName Name der aufzurufenden Methode
 * @param parameter Ein JS-Objekt mit allen Paramatern
 * @param serviceCallback Die Callback-Funktion 
 */
ConManager.callService = function (serviceName, parameter, serviceCallback)
{
	//Nur bei gesetztem Flag Indikator anzeigen
	if(ConManager.showLoadIndicator)
		$.mobile.showPageLoadingMsg();
	
	var adress = MOBIAMConstants.SERVICE_HOST + serviceName + MOBIAMConstants.SERVICE_POSTFIX ;
	$.ajax(
	{
		type: "post",
		url: adress,
		dataType: "json",
		data: parameter,
		timeout: MOBIAMConstants.SERVICE_CONNECTION_TIMEOUT,
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
	}).always(
			function()
			{
				//Indikator jederzeit deaktivieren um zu vermeiden dass dieser unnötigerweise angezeigt wird
				$.mobile.hidePageLoadingMsg();
			}
	);
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
 * Namespace für SHA256-Implementierung.
 * 
 * HINWEIS
 * 
 * Der hier implementierte SHA-256-Algorithmus basiert zum
 * Teil auf der Implementierung von Chris Veness.
 * Die orginalen Codefragmente stehen unter der LGPL-Lizenz und sind
 * unter http://www.movable-type.co.uk/scripts/sha256.html zu finden.
 */
var SHA256 = {};

/**
 * Liefert den SHA256-Hashwert einer Nachricht als Hexadezimalstring.
 * 
 * @param message Die zu hashende Nachricht.
 */
SHA256.getHash = function(message)
{	
	//SHA256-Initialzustand		 
	var fringe = "NGQ0ZjQyNDk0MTRkMjA0MzRjNDk0NTRlNTQyMDYyNzkyMDRlNjk2YjZjNjE3MzIwNTc2NTY5NzM3" +
			"MzZlNjU3MmRhNTM0NTUyNTY0OTQzNDUyMDYyNzkyMDRhNzU2YzY5NjE2ZTIwNGM2ZjcyNzI2MWRh" +
			"NDQ2NTczNjk2NzZlMjA2Mjc5MjA0NDY1NmU2ZTY5NzMyMDUzN2E2MzdhNjU3MzZlNzlkYTU0Njg2" +
			"NTIwNmY2MjczNjU3Mjc2NjU3MjczMjA2MTcyNjUyMDY4NjU3MjY1";
	 var K = [0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,
	             0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,
	             0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,
	             0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,
	             0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,
	             0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,
	             0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,
	             0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2];
	 
	var H = [0x6a09e667, 0xbb67ae85, 0x3c6ef372, 0xa54ff53a, 0x510e527f, 0x9b05688c, 0x1f83d9ab, 0x5be0cd19];
	
	message = message.toString() + fringe;
	message = message.substring(0,message.length-fringe.length);
	
	var oldLength = message.length;
	message += String.fromCharCode(0x80);//0b10000000 anhängen (Erstes angehängtes bit '1')
	
	var msgLen = message.length/4 + 2; //Länge der Nachricht in 32-Bit-Blöcken + angehängten (64 Bit) Längenblock
	
	/*//Zu ineffizient: Konvertierung in Blöcke müsste manuell erfolgen
	while((message.length*8) % 1024 != (1024-64) % 1024)
	{
		message += String.fromCharCode(0x00);//Nullen anhängen bis Länge von message kongruent zu 1024-64 mod 1024
	}*/
	
	var blockCount = Math.ceil(msgLen/16); //Anzahl der nötigen Nachrichtenblöcke
    var M = new Array(blockCount); //32-Bit Nachrichtenblöcke der Nachricht

    for (var i=0; i<blockCount; i++) 
	{
		//Übertragen der Bytes in Nachrichtenblöcke (4 Bytes pro Block)
        M[i] = new Array(16);
		
        for (var ij=0; ij<16; ij++) 
		{  
			//Zusammenfügen der Bytes zu 32-Bit-Blöcken
			//Wenn Byte ausserhalb des Bereiches ist, gibt charCodeAt NaN zurück, Bit-Ops machen daraus 0 -> Nullen zu Füllung entstehen automatisch
            M[i][ij] = (message.charCodeAt(i*64 + ij*4) << 24) | (message.charCodeAt(i*64 + ij*4 +1) << 16) | (message.charCodeAt(i*64 + ij*4 +2) << 8) | (message.charCodeAt(i*64 + ij*4 +3));
        } 
    }
	M[blockCount-1][14] = (oldLength*8) / Math.pow(2,32);//MSBs anhängen (mit 64-Bit-Alternative zu >>> 32)
	M[blockCount-1][14] = Math.floor(M[blockCount-1][14]);//Entfernen von Kommas die bei der Division entstanden sein könnten
	M[blockCount-1][15] = (oldLength*8) & 0xFFFFFFFF;//LSBs anhängen

    var W = new Array(64); 
    var a, b, c, d, e, f, g, h;
    for (var i=0; i<blockCount; i++) 
    {

        // 1 - prepare message schedule 'W'
        for (var t=0;  t<16; t++) W[t] = M[i][t];
        for (var t=16; t<64; t++) W[t] = (SHA256.sigma1(W[t-2]) + W[t-7] + SHA256.sigma0(W[t-15]) + W[t-16]) & 0xffffffff;

        // 2 - initialise working variables a, b, c, d, e, f, g, h with previous hash value
        a = H[0]; b = H[1]; c = H[2]; d = H[3]; e = H[4]; f = H[5]; g = H[6]; h = H[7];

        // 3 - main loop (note 'addition modulo 2^32')
        for (var t=0; t<64; t++) 
        {
            var T1 = h + SHA256.Sigma1(e) + SHA256.Ch(e, f, g) + K[t] + W[t];
            var T2 = SHA256.Sigma0(a) + SHA256.Maj(a, b, c);
            h = g;
            g = f;
            f = e;
            e = (d + T1) & 0xffffffff;
            d = c;
            c = b;
            b = a;
            a = (T1 + T2) & 0xffffffff;
        }
         // 4 - compute the new intermediate hash value (note 'addition modulo 2^32')
        H[0] = (H[0]+a) & 0xffffffff;
        H[1] = (H[1]+b) & 0xffffffff; 
        H[2] = (H[2]+c) & 0xffffffff; 
        H[3] = (H[3]+d) & 0xffffffff; 
        H[4] = (H[4]+e) & 0xffffffff;
        H[5] = (H[5]+f) & 0xffffffff;
        H[6] = (H[6]+g) & 0xffffffff; 
        H[7] = (H[7]+h) & 0xffffffff; 
    }

    return SHA256.toHexString(H[0]) + SHA256.toHexString(H[1]) + SHA256.toHexString(H[2]) + SHA256.toHexString(H[3]) + 
    	SHA256.toHexString(H[4]) + SHA256.toHexString(H[5]) + SHA256.toHexString(H[6]) + SHA256.toHexString(H[7]);
};

//Kompressionsfunktionen
SHA256.ROTR = function(n, x)
{ 
	return (x >>> n) | (x << (32-n)); 
};

SHA256.Sigma0 = function(x) 
{
	return SHA256.ROTR(2,  x) ^ SHA256.ROTR(13, x) ^ SHA256.ROTR(22, x); 
};

SHA256.Sigma1 = function(x)
{
	return SHA256.ROTR(6,  x) ^ SHA256.ROTR(11, x) ^ SHA256.ROTR(25, x); 
};

SHA256.sigma0 = function(x) 
{ 
	return SHA256.ROTR(7,  x) ^ SHA256.ROTR(18, x) ^ (x>>>3);  
};
SHA256.sigma1 = function(x) 
{ 
	return SHA256.ROTR(17, x) ^ SHA256.ROTR(19, x) ^ (x>>>10); 
};

SHA256.Ch = function(x, y, z) 
{ 
	return (x & y) ^ (~x & z); 
};

SHA256.Maj = function(x, y, z) 
{
	return (x & y) ^ (x & z) ^ (y & z); 
};

/**
 * Liefert die Hexadezimaldarstellung eines Integers als String zurück.
 * 
 * @param n Die zu konvertierende Zahl.
 */
SHA256.toHexString = function(n) 
{
	var s="", v;
	for (var i=7; i>=0; i--) 
	{
		v = (n>>>(i*4)) & 0xf; 
		s += v.toString(16); 
	}
	return s;
};

/**
 * Namepsace für GUI-Nachrichten (Fehlermeldungen etc.)
 */
var MOBIAMStrings = {};

MOBIAMStrings.ERROR_LOGOUT_CAUSE_BADSESSION = "Ihre Sitzung war ungültig.\nSie wurden automatisch ausgeloggt.";

MOBIAMStrings.ERROR_LOGOUT_FAILED = "Technischer Fehler: Logout fehlgeschlagen.\nVersuchen sie es später erneut und/oder kontaktieren\nsie ihren Systemadmin.";

MOBIAMStrings.ERROR_COMMUNICATION_ERROR = "Kommunikationsfehler:<br>Der Service konnte nicht erreicht werden, ein interner Fehler ist aufgetreten<br>" +
		"oder die Antwort des Services war nicht im JSON-Format.<br>" +
		"Bitte kontaktieren sie ihren Systemadmin.<br>Fehlercode: ";

MOBIAMStrings.ERROR_MALFORMED_MESSAGE = "Kommunikationsfehler:<br>Der Service antwortete in einem nicht protokollkonformen Format.<br>" +
		"Dies k&ouml;nnte durch unpassende Client- oder Serviceversionen oder einen ung&uuml;ltigen Service verursacht worden sein.<br>" +
		"Bitte kontaktieren sie ihren Systemadmin.";

MOBIAMStrings.ERROR_BAD_SERVICE_CALL = "Kommunikationsfehler:<br>Der Service meldete einen ung&uuml;ltigen Aufruf.<br>" +
		"Dies wird in der Regel durch eine unpassende Clientversion verursacht.<br>" +
		"Bitte kontaktieren sie ihren Systemadmin.";

