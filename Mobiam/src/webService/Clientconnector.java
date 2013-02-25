package webService;


import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import util.ErrorTypeManager;
import util.SessionManager;

import com.google.gson.JsonObject;

import database.Databaseconnector;


@Path("/WebService")
/**
 * @author julian lorra
 *
 */
public class Clientconnector {
	private int sessiontime = 120;

	//login method
	/**
	 * 
	 * @param tenant
	 * @param office
	 * @param empid
	 * @param pass
	 * @return JSON answer for website
	 */
	@POST
	@Path("/login")
	@Produces("application/json")
	public String login(@FormParam("tenant") String tenant,
								@FormParam("office") String office,
								@FormParam("empid") String empid,
								@FormParam("pass") String pass)
	{
		

		JsonObject jo= new JsonObject();		
		String feeds  = null;
		try {
			String db = Databaseconnector.databaserequest("Select pass, idusers from database.users where tenant like '"+tenant+"' and office like '"+office+"' and empid like '"+empid+"'",2);
			String[] databaseanswer = db.split(",");
				if(tenant==null||office==null||empid==null||pass==null){
					jo.addProperty("type", "error");
					jo.addProperty("message", "Missing login data!");
					jo.addProperty("errorID", 101);
					
					if(tenant==null){
						jo.addProperty("missingData","tenant");
					}
					if(office==null){
						jo.addProperty("missingData","office");
					}
					if(empid==null){
						jo.addProperty("missingData","empid");
					}
					if(pass==null){
						jo.addProperty("missingData","pass");
					}	
				}
				else{
					if(databaseanswer[0].equals(pass))
					{
						String SessionID = SessionManager.uniqesessionID();
						
						jo.addProperty("type", "success");
						Databaseconnector.databaseinsert("INSERT INTO database.sessions (userid,sessionid) VALUES ('"+databaseanswer[1]+"', '"+SessionID+"')");
						jo.addProperty("sessionID",SessionID);
						jo.addProperty("userID",databaseanswer[1]);
						jo.addProperty("timeLeft", sessiontime);	
					}
					else{
						jo = ErrorTypeManager.seterror110();
					}
				}
					
		} catch (Exception e) {
			jo = ErrorTypeManager.seterror114();

		}

		feeds = jo.toString();
		return feeds;
	}
	
	/**
	 * 
	 * @param sessionID
	 * @return JSON answer for website 
	 */

	
}

