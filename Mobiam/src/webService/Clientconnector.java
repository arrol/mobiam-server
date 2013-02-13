package webService;


import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import com.google.gson.Gson;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;


@Path("/WebService")
public class Clientconnector {
	
	//TO
	String example_tenant = "Knifto Industries";
	String example_office = "Bochum";
	String example_empid = "1";
	String example_pass   = "gfos";
	String example_session = "cafebabe";
	String example_name = "Herr Gordon Freeman";
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
				if(example_tenant.equals(tenant)&&example_office.equals(office)&&example_empid.equals(empid)&&example_pass.equals(pass))
				{
					jo.addProperty("type", "success");
					jo.addProperty("sessionID", example_session);
					jo.addProperty("timeLeft", example_sessiontime);	
				}
				else{
					jo.addProperty("type", "error");
					jo.addProperty("message","Bad login data!");
					jo.addProperty("errorID", 210);
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
		if(!sessionID.equals(example_session)){	
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
	
	//TODO: define list
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
		if(sessionID.equals(example_session))
		{
			jo.addProperty("type", "success");
			jo.addProperty("name", example_name);
			jo.addProperty("tenant",example_tenant);
			jo.addProperty("office", example_office);
			jo.addProperty("empid", example_empid);
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

