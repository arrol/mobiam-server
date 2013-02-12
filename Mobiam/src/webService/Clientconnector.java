package webService;


import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import com.google.gson.JsonObject;


@Path("/WebService")
public class Clientconnector {
	String example_tenant = "a";
	String example_office = "a";
	String example_emplid = "a";
	String example_pass   = "a";
	String example_session = "cafebabe";
	int example_sessiontime = 120;
	JsonObject jo= new JsonObject();
	
	@POST
	@Path("/Clientrequest")
	@Produces("application/json")
	public String login(@FormParam("tenant") String tenant,
								@FormParam("office") String office,
								@FormParam("emplid") String emplid,
								@FormParam("pass") String pass)
	{
		String feeds  = null;
			if(tenant==null||office==null||emplid==null||pass==null){
				jo.addProperty("type", "error");
				jo.addProperty("message", "Missing login data!");
				jo.addProperty("errorID", 101);
				
				if(tenant==null){
					jo.addProperty("missingData","tenant");
				}
				if(office==null){
					jo.addProperty("missingData","office");
				}
				if(emplid==null){
					jo.addProperty("missingData","emplid");
				}
				if(pass==null){
					jo.addProperty("missingData","pass");
				}
				
				
			}
			else{
				if(example_tenant.equals(tenant)&&example_office.equals(office)&&example_emplid.equals(emplid)&&example_pass.equals(pass))
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

}

