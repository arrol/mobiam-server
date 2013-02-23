package util;

import java.util.Random;

import database.Databaseconnector;

public class SessionManager {
	//create a unique session ID
	/**
	 * @return String Unique SessionID
	 */
	public static String uniqesessionID(){
		String sessionID="";
		Random rand = new Random();
		for(int i=0; i<30; i++){
			sessionID+=rand.nextInt(9);
		}
		String db = Databaseconnector.databaserequest("select sessionid from database.sessions where sessionid like '"+sessionID+"'",1);
		if (db!="")sessionID=uniqesessionID();
		return sessionID;
	}
	/**
	 * 
	 * @param sessionID
	 * @return String array  [0]= 1 session ok; [0]= 0 bad session ; [1] userid
	 */
	 public static String[] verifysessionid(String sessionID){
		String[] sessionok =new String[2] ;
		String db = Databaseconnector.databaserequest("Select sessionid, userid from database.sessions where sessionID like '"+sessionID+"'",2);
		String[] databaseanswer = db.split(",");
		if(sessionID!=null&&sessionID.equals(databaseanswer[0])){
			sessionok[0] = "1";
			sessionok[1]= databaseanswer[1];
		}else{
			sessionok[0] = "0";
		}
		return sessionok;
	}
}
