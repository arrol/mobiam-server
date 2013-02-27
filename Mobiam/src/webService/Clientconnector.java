package webService;


import java.util.ArrayList;
import java.util.Collections;
import java.util.List;

import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import util.Employee;
import util.ErrorTypeManager;
import util.PropertyManager;
import util.SessionManager;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import database.DatabaseConnectionManager;


@Path("/WebService")
/**
 * @author julian lorra
 *
 */
public class Clientconnector {


	/**
	 * 
	 * @param sessionID
	 * @return JSON answer for website 
	 */

	@POST
	@Path("/logout")
	@Produces("application/json")
	public String logout(@FormParam("sessionID") String sessionID)
	{
		JsonObject jo= new JsonObject();
		String feeds  = null;
		try {
			if(SessionManager.verifysessionid(sessionID)[0].equals("1")){
				DatabaseConnectionManager.databaseinsert("delete from database.sessions where sessionid like '"+sessionID+"'");
				jo.addProperty("type", "success");
				jo.addProperty("sessionID", sessionID);
			}else{
				jo = ErrorTypeManager.seterror102();
				
			}
		} catch (Exception e) {
			jo = ErrorTypeManager.seterror100();
		}
		
		
		feeds = jo.toString();
		return feeds;
	}

	/**
	 * 
	 * @param sessionID
	 * @return
	 */
	@POST
	@Path("/keepalive")
	@Produces("application/json")
	public String keepalive(@FormParam("sessionID") String sessionID)
	{
		JsonObject jo= new JsonObject();
		String feeds  = null;
		try {
			if(SessionManager.verifysessionid(sessionID)[0].equals("1"))
			{
				jo.addProperty("type", "success");
				jo.addProperty("sessionID", sessionID);
				jo.addProperty("timeLeft", PropertyManager.getSessiontime());
				
			}else{
				jo = ErrorTypeManager.seterror102();
			}
		} catch (Exception e) {
			jo = ErrorTypeManager.seterror100();
		}
		
		feeds = jo.toString();
		return feeds;
	}

	
	/**
	 * 
	 * @param sessionID
	 * @return JSON answer for website
	 */
	@POST
	@Path("/list")
	@Produces("application/json")
	public String list(@FormParam("sessionID") String sessionID)
	{
		JsonObject jo= new JsonObject();
		String feeds  = null;
		try {
			String session[]= SessionManager.verifysessionid(sessionID);
			if(session[0].equals("1"))
			{

			    List<Employee> list= Collections.synchronizedList(new ArrayList<Employee>() );
	 
			    String userlist= DatabaseConnectionManager.databaserequest("Select listetuser from database.groups where readinguser like '"+session[1]+"' ",1);
			    String user[] = userlist.split(",;");
			    for (String userid : user) {
			    	 String causelist= DatabaseConnectionManager.databaserequest("Select causesallowed from database.groups where readinguser like '"+session[1]+"' and listetuser like '"+userid+"'",1);
					 String causeallowed[] = causelist.split(",;");
			    	list.add(new Employee(userid,causeallowed[0]));
				}
				jo.addProperty("type", "success");
				jo.addProperty("timeLeft", PropertyManager.getSessiontime());
			    Gson gson = new Gson();
				jo.add("data", gson.toJsonTree(list, ArrayList.class));
				
			}else{
				jo = ErrorTypeManager.seterror102();
			}
		} catch (Exception e) {
			jo = ErrorTypeManager.seterror100();
		}

		
		feeds = jo.toString();
		return feeds;
	}
	
	/**
	 * 
	 * @param sessionID
	 * @return JSON answer for website
	 */
	@POST
	@Path("/identifyMe")
	@Produces("application/json")
	public String indentifyMe(@FormParam("sessionID") String sessionID)
	{
		JsonObject jo= new JsonObject();
		String feeds  = "";
		try {
			String db = DatabaseConnectionManager.databaserequest("Select userid from database.sessions where sessionID like '"+sessionID+"'",1);
			String[] databaseanswer = db.split(",;");
			if(sessionID!=null&&databaseanswer[0]!=null)
			{
				String db2 = DatabaseConnectionManager.databaserequest("Select username ,tenant, office, empid from database.users where idusers like '"+databaseanswer[0]+"'",4);
				String[] databaseanswer2 = db2.split(",");
				jo.addProperty("type", "success");
				jo.addProperty("name", databaseanswer2[0]);
				jo.addProperty("tenant",databaseanswer2[1]);
				jo.addProperty("office", databaseanswer2[2]);
				jo.addProperty("empid", databaseanswer2[3]);
			}else
			{
				jo = ErrorTypeManager.seterror102();
			}
		} catch (Exception e) {
			jo = ErrorTypeManager.seterror100();
		}

		feeds = jo.toString();
		return feeds;
	}
	/**
	 * 
	 * @param sessionID
	 * @return JSON answer for website
	 */

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
				if(tenant==null||office==null||empid==null||pass==null){
					jo = ErrorTypeManager.seterror210();
				}
				else{
					String db = DatabaseConnectionManager.databaserequest("Select pass, idusers from database.users where tenant like '"+tenant+"' and office like '"+office+"' and empid like '"+empid+"'",2);
					String[] databaseanswer = db.split(",");
					if(databaseanswer[0].equals(pass))
					{
						String SessionID = SessionManager.uniqesessionID();
						DatabaseConnectionManager.databaseinsert("INSERT INTO database.sessions (userid,sessionid) VALUES ('"+databaseanswer[1]+"', '"+SessionID+"')");
						jo.addProperty("type", "success");
						jo.addProperty("sessionID",SessionID);
						jo.addProperty("userID",databaseanswer[1]);
						jo.addProperty("timeLeft", PropertyManager.getSessiontime());	
					}
					else{
						jo = ErrorTypeManager.seterror210();
					}
				}
					
		} catch (Exception e) {
			jo = ErrorTypeManager.seterror100();
	
		}
	
		feeds = jo.toString();
		return feeds;
	}
	

}

