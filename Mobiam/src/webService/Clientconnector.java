package webService;


import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import com.google.gson.Gson;
import com.google.gson.JsonObject;

import database.Databaseconnector;


@Path("/WebService")
public class Clientconnector {
	
	//TO
	String example_session = "cafebabe";
	int example_sessiontime = 120;
	
	//TODO: define login D
	@POST
	@Path("/login")
	@Produces("application/json")
	public String login(@FormParam("tenant") String tenant,
								@FormParam("office") String office,
								@FormParam("empid") String empid,
								@FormParam("pass") String pass)
	{
		

		JsonObject jo= new JsonObject();
		String db = Databaseconnector.databaserequest("Select pass from database.users where tenant like '"+tenant+"' and office like '"+office+"' and empid like '"+empid+"'",1);
		String[] databaseanswer = db.split(",");
		
		String feeds  = null;
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
					jo.addProperty("type", "success");
					jo.addProperty("sessionID", example_session);
					jo.addProperty("timeLeft", example_sessiontime);	
				}
				else{
					jo.addProperty("type", "error");
					jo.addProperty("message","Bad login data!");
					jo.addProperty("errorID", 210);
					jo.addProperty("pass", databaseanswer[0]);
				}
			}
			
		feeds = jo.toString();
		return feeds;
	}
	
	//TODO: define logout D
	@POST
	@Path("/logout")
	@Produces("application/json")
	public String logout(@FormParam("sessionID") String sessionID)
	{
		JsonObject jo= new JsonObject();
		String feeds  = null;
		if(!sessionID.equals(example_session)||sessionID==null){	
			jo.addProperty("type", "error");
			jo.addProperty("message", "Bad session!");
			jo.addProperty("errorID", 102);
		}else{
			jo.addProperty("type", "success");
			jo.addProperty("sessionID", example_session);
		}
		
		feeds = jo.toString();
		return feeds;
	}

	//TODO: define keepalive D
	@POST
	@Path("/keepalive")
	@Produces("application/json")
	public String keepalive(@FormParam("sessionID") String sessionID)
	{
		JsonObject jo= new JsonObject();
		String feeds  = null;
		if(!sessionID.equals(example_session)){	
			jo.addProperty("type", "error");
			jo.addProperty("message", "Bad session!");
			jo.addProperty("errorID", 102);
		}else{
			jo.addProperty("type", "success");
			jo.addProperty("sessionID", example_session);
			jo.addProperty("timeLeft", example_sessiontime);
		}
		feeds = jo.toString();
		return feeds;
	}
	
	//TODO: define list D
	@POST
	@Path("/list")
	@Produces("application/json")
	public String list(@FormParam("sessionID") String sessionID)
	{
		JsonObject jo= new JsonObject();
		String feeds  = null;
		
		
		
		if(!sessionID.equals(example_session)){	
			jo.addProperty("type", "error");
			jo.addProperty("message", "Bad session!");
			jo.addProperty("errorID", 102);
		}else{
			jo.addProperty("type", "success");
			jo.addProperty("timeLeft", example_sessiontime);
		    Gson gson = new Gson();
		    List<Employe> list= Collections.synchronizedList(new ArrayList<Employe>() );
		   
		    for (String name : Employe.example_names) {
		    	list.add(new Employe(name));
			}
		    
			
			jo.add("data", gson.toJsonTree(list, ArrayList.class));
		}
		
		feeds = jo.toString();
		return feeds;
	}
	
	@POST
	@Path("/identifyMe")
	@Produces("application/json")
	public String indentifyMe(@FormParam("sessionID") String sessionID)
	{
		JsonObject jo= new JsonObject();
		String feeds  = "";
		String db = Databaseconnector.databaserequest("Select userid name from database.sessions where sessionID like '"+sessionID+"'",1);
		String[] databaseanswer = db.split(",");
		if(sessionID!=null&&databaseanswer[0]!=null)
		{
			String db2 = Databaseconnector.databaserequest("Select name ,tenant, office, empid from database.users where idusers like '"+databaseanswer[0]+"'",4);
			String[] databaseanswer2 = db2.split(",");
			jo.addProperty("type", "success");
			jo.addProperty("name", databaseanswer2[0]);
			jo.addProperty("tenant",databaseanswer2[1]);
			jo.addProperty("office", databaseanswer2[2]);
			jo.addProperty("empid", databaseanswer2[3]);
		}else
		{
			jo.addProperty("type", "error");
			jo.addProperty("message", "Bad session!");
			jo.addProperty("errorID", 102);
		}
		feeds = jo.toString();
		return feeds;
	}
	
	
}

