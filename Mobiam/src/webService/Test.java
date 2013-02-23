package webService;

import database.Databaseconnector;

public class Test {

	/**
	 * @param args
	 */
	public static void main(String[] args) {
		// TODO Auto-generated method stub
		String sessionID="cafebabe";
		String db = Databaseconnector.databaserequest("Select userid from database.sessions where sessionID like '"+sessionID+"'",1);
		String[] databaseanswer = db.split(",");
		System.out.println(databaseanswer[0]);
	}

}
