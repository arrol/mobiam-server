package webService;


import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;
import java.util.ArrayList;
import java.util.Collections;
import java.util.List;
import java.util.Random;

import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;
import javax.xml.ws.soap.Addressing;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import database.Databaseconnector;


@Path("/WebService")
/**
 * @author julian lorra
 *
 */
public class Clientconnector {
	//
	int example_sessiontime = 120;
	String adminuser="root";
	String adminpwd="mobiamadmin";

	//create a unique session ID
	/**
	 * @return String Unique SessionID
	 */
	private String uniqesessionID(){
		String sessionID="";
		Random rand = new Random();
		for(int i=0; i<30; i++){
			sessionID+=rand.nextInt(9);
		}
		String db = Databaseconnector.databaserequest("select sessionid from database.sessions where sessionid like '"+sessionID+"'",1);
		if (db!="")sessionID=uniqesessionID();
		return sessionID;
	}
	private boolean verifysessionid(String sessionID){
		boolean sessionok = false;
		String db = Databaseconnector.databaserequest("Select userid from database.sessions where sessionID like '"+sessionID+"'",1);
		String[] databaseanswer = db.split(",");
		if(sessionID!=null&&sessionID.equals(databaseanswer[0])){
			sessionok = true;
		}
		return sessionok;
	}
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
		String db = Databaseconnector.databaserequest("Select pass, idusers from database.users where tenant like '"+tenant+"' and office like '"+office+"' and empid like '"+empid+"'",2);
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
					String SessionID = uniqesessionID();
					
					jo.addProperty("type", "success");
					Databaseconnector.databaseinsert("INSERT INTO database.sessions (userid,sessionid) VALUES ('"+databaseanswer[1]+"', '"+SessionID+"')");
					jo.addProperty("sessionID",SessionID);
					jo.addProperty("userID",databaseanswer[1]);
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
	
	/**
	 * 
	 * @param sessionID
	 * @return JSON answer for website 
	 */
	//TODO:logout check logout succes in db
	@POST
	@Path("/logout")
	@Produces("application/json")
	public String logout(@FormParam("sessionID") String sessionID)
	{
		JsonObject jo= new JsonObject();
		String feeds  = null;
		
		if(verifysessionid(sessionID)){
			Databaseconnector.databaseinsert("delete from database.sessions where sessionid like '"+sessionID+"'");
			jo.addProperty("type", "success");
			jo.addProperty("sessionID", sessionID);
		}else{
			jo.addProperty("type", "error");
			jo.addProperty("message", "Bad session!");
			jo.addProperty("errorID", 102);
			
		}
		
		feeds = jo.toString();
		return feeds;
	}

	
	@POST
	@Path("/keepalive")
	@Produces("application/json")
	public String keepalive(@FormParam("sessionID") String sessionID)
	{
		JsonObject jo= new JsonObject();
		String feeds  = null;
		if(verifysessionid(sessionID))
		{
			jo.addProperty("type", "success");
			jo.addProperty("sessionID", sessionID);
			jo.addProperty("timeLeft", example_sessiontime);
			
		}else{
			jo.addProperty("type", "error");
			jo.addProperty("message", "Bad session!");
			jo.addProperty("errorID", 102);
		}
		feeds = jo.toString();
		return feeds;
	}
	
	//TODO: list rewrite for db
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
		
		
		String db = Databaseconnector.databaserequest("Select userid from database.sessions where sessionID like '"+sessionID+"'",1);
		String[] databaseanswer = db.split(",");
		if(sessionID!=null&&databaseanswer[0]!=null)
		{
			jo.addProperty("type", "success");
			jo.addProperty("timeLeft", example_sessiontime);
		    Gson gson = new Gson();
		    List<Employee> list= Collections.synchronizedList(new ArrayList<Employee>() );
 
		    String userlist= Databaseconnector.databaserequest("Select listetuser from database.groups where readinguser like '"+databaseanswer[0]+"' ",1);
		    String user[] = userlist.split(",;");
		    for (String userid : user) {
		    	 String causelist= Databaseconnector.databaserequest("Select causesallowed from database.groups where readinguser like '"+databaseanswer[0]+"' and listetuser like '"+userid+"'",1);
				 String causeallowed[] = causelist.split(",;");
		    	list.add(new Employee(userid,causeallowed[0]));
			}
		    
			jo.addProperty("ab", userlist);
			jo.add("data", gson.toJsonTree(list, ArrayList.class));
			
		}else{
			jo.addProperty("type", "error");
			jo.addProperty("message", "Bad session!");
			jo.addProperty("errorID", 102);
		}
		
		feeds = jo.toString();
		return feeds;
	}
	
	//TODO: define identifyme D
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
		String db = Databaseconnector.databaserequest("Select userid from database.sessions where sessionID like '"+sessionID+"'",1);
		String[] databaseanswer = db.split(",;");
		if(sessionID!=null&&databaseanswer[0]!=null)
		{
			String db2 = Databaseconnector.databaserequest("Select username ,tenant, office, empid from database.users where idusers like '"+databaseanswer[0]+"'",4);
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
	
	//TODO: define adduser D
	/**
	 * 
	 * @param tenant
	 * @param office
	 * @param empid
	 * @param pass
	 * @param name
	 * @param attendance
	 * @param cause
	 * @param user
	 * @param pwd
	 * @return JSON answer for website
	 */
		@POST
		@Path("/adduser")
		@Produces("application/json")
		public String adduser(@FormParam("tenant") String tenant,
				@FormParam("office") String office,
				@FormParam("empid") String empid,
				@FormParam("pass") String pass,
				@FormParam("name") String name,
				@FormParam("attendance")String attendance,
				@FormParam("cause")String cause,
				@FormParam("user")String user,
				@FormParam("pwd")String pwd)
		{
			JsonObject jo= new JsonObject();
			String feeds  = null;

			if(user.equals(adminuser)&&pwd.equals(adminpwd)){ 
				if(tenant!=null&&office!=null&&empid!=null&&pass!=null&&name!=null&&(attendance.equals("0")||attendance.equals("1")))
				{
					try {
						MessageDigest md = MessageDigest.getInstance("SHA-256");
						md.update(pass.getBytes());
						int i =0;
						byte sha[] = md.digest();
						pass="";
						while( sha.length>i)
						pass+=(char)sha[i++];
					} catch (NoSuchAlgorithmException e) {
						// TODO Auto-generated catch block
						e.printStackTrace();
					}
					Databaseconnector.databaseinsert("INSERT INTO database.users (tenant,office,empid,pass,username,attendance,cause) VALUES ('"+tenant+"', '"+office+"','"+empid+"','"+pass+"','"+name+"',"+attendance+",'"+cause+"')");
					jo.addProperty("type", "success");
					
				}else{
					jo.addProperty("type", "error");
					jo.addProperty("message", "Bad Userdata!");
					jo.addProperty("errorID", 102);
				}
			}else{
				jo.addProperty("type", "error");
				jo.addProperty("message", "Bad ADMIN Login!");
				jo.addProperty("errorID", 102);
			}
			feeds = jo.toString();
			return feeds;
		}
		//TODO: define adduser D
		/**
		 * 
		 * @param readinguser
		 * @param listetuser
		 * @param causesallowed
		 * @param user
		 * @param pwd
		 * @return JSON answer for website
		 */
		@POST
		@Path("/addgroup")
		@Produces("application/json")
		public String addgroup(@FormParam("readinguser") String readinguser,
				@FormParam("listetuser") String listetuser,
				@FormParam("causesallowed") String causesallowed,
				@FormParam("user")String user,
				@FormParam("pwd")String pwd)
		{
			JsonObject jo= new JsonObject();
			String feeds  = null;
			if(user.equals(adminuser)&&pwd.equals(adminpwd)){ 
				if(readinguser!=null&&listetuser!=null&&causesallowed!=null)
				{
					Databaseconnector.databaseinsert("INSERT INTO `database`.`groups` (`readinguser`, `listetuser`, `causesallowed`) VALUES ('"+readinguser+"', '"+listetuser+"', '"+causesallowed+"')");
					jo.addProperty("type", "success");
					
				}else{
					jo.addProperty("type", "error");
					jo.addProperty("message", "Bad Userdata!");
					jo.addProperty("errorID", 102);
				}
			}else{
				jo.addProperty("type", "error");
				jo.addProperty("message", "Bad ADMIN Login!");
				jo.addProperty("errorID", 102);
			}
			feeds = jo.toString();
			return feeds;
		}
}

