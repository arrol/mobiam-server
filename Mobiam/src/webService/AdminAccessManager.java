package webService;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import util.ErrorTypeManager;

import com.google.gson.JsonObject;

import database.Databaseconnector;
@Path("/AdminService")
/**
 * @author julian lorra
 *
 */
public class AdminAccessManager {
	String adminuser="root";
	String adminpwd="mobiamadmin";

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
			try {
				if(user.equals(adminuser)&&pwd.equals(adminpwd)){ 
					if(tenant!=null&&office!=null&&empid!=null&&pass!=null&&name!=null&&(attendance.equals("0")||attendance.equals("1")))
					{
						try {
							MessageDigest md = MessageDigest.getInstance("SHA-256");
							md.update(pass.getBytes());
							int i =0;
							byte sha[] = md.digest();

							StringBuffer hexString = new StringBuffer();
					    	for (int b=0;i<sha.length;i++) {
					    	  hexString.append(Integer.toHexString(0xFF & sha[b]));
					    	}
					    	pass = hexString.toString();
						} catch (NoSuchAlgorithmException e) {
							e.printStackTrace();
						}
						Databaseconnector.databaseinsert("INSERT INTO database.users (tenant,office,empid,pass,username,attendance,cause) VALUES ('"+tenant+"', '"+office+"','"+empid+"','"+pass+"','"+name+"',"+attendance+",'"+cause+"')");
						jo.addProperty("type", "success");
						jo.addProperty("pass",pass );
						
					}else{
						jo = ErrorTypeManager.seterror100();
					}
				}else{
					jo = ErrorTypeManager.seterror111();
				}
			} catch (Exception e) {
				jo = ErrorTypeManager.seterror114();
			}


			feeds = jo.toString();
			return feeds;
		}

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
			try {
				if(user.equals(adminuser)&&pwd.equals(adminpwd)){ 
					if(readinguser!=null&&listetuser!=null&&causesallowed!=null)
					{
						Databaseconnector.databaseinsert("INSERT INTO `database`.`groups` (`readinguser`, `listetuser`, `causesallowed`) VALUES ('"+readinguser+"', '"+listetuser+"', '"+causesallowed+"')");
						jo.addProperty("type", "success");
						
					}else{
						jo = ErrorTypeManager.seterror100();
					}
				}else{
					jo = ErrorTypeManager.seterror111();
				}
			} catch (Exception e) {
				jo = ErrorTypeManager.seterror114();
			}

			feeds = jo.toString();
			return feeds;
		}
}
