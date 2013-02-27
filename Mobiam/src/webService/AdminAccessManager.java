package webService;

import javax.ws.rs.FormParam;
import javax.ws.rs.POST;
import javax.ws.rs.Path;
import javax.ws.rs.Produces;

import util.ErrorTypeManager;
import util.PropertyManager;
import util.Sha256Factory;

import com.google.gson.JsonObject;

import database.DatabaseConnectionManager;
@Path("/AdminService")
/**
 * @author julian lorra
 *
 */
public class AdminAccessManager {


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
		@Path("/addUser")
		@Produces("application/json")
		public String addUser(@FormParam("tenant") String tenant,
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
				if(user.equals(PropertyManager.getAdminuser())&&pwd.equals(PropertyManager.getAdminpwd())){ 
					if(tenant!=null&&office!=null&&empid!=null&&pass!=null&&name!=null&&(attendance.equals("0")||attendance.equals("1")))
					{
						
						
					    	pass = Sha256Factory.StringTosha256Hex(pass);
						
						DatabaseConnectionManager.databaseinsert("INSERT INTO database.users (tenant,office,empid,pass,username,attendance,cause) VALUES ('"+tenant+"', '"+office+"','"+empid+"','"+pass+"','"+name+"',"+attendance+",'"+cause+"')");
						jo.addProperty("type", "success");
						
					}else{
						jo = ErrorTypeManager.seterror200();
					}
				}else{
					jo = ErrorTypeManager.seterror211();
				}
			} catch (Exception e) {
				jo = ErrorTypeManager.seterror100();
			}


			feeds = jo.toString();
			return feeds;
		}

		/**
		 * 
		 * @param readingUser
		 * @param listedUser
		 * @param causesallowed
		 * @param user
		 * @param pwd
		 * @return JSON answer for website
		 */
		@POST
		@Path("/addgroup")
		@Produces("application/json")
		public String addgroup(@FormParam("readinguser") String readingUser,
				@FormParam("listeduser") String listedUser,
				@FormParam("causesallowed") String causesallowed,
				@FormParam("user")String user,
				@FormParam("pwd")String pwd)
		{
			JsonObject jo= new JsonObject();
			String feeds  = null;
			try {
				if(user.equals(PropertyManager.getAdminuser())&&pwd.equals(PropertyManager.getAdminpwd())){ 
					if(readingUser!=null&&listedUser!=null&&causesallowed!=null)
					{
						DatabaseConnectionManager.databaseinsert("INSERT INTO `database`.`groups` (`readinguser`, `listetuser`, `causesallowed`) VALUES ('"+readingUser+"', '"+listedUser+"', '"+causesallowed+"')");
						jo.addProperty("type", "success");
						
					}else{
						jo = ErrorTypeManager.seterror200();
					}
				}else{
					jo = ErrorTypeManager.seterror211();
				}
			} catch (Exception e) {
				jo = ErrorTypeManager.seterror100();
			}

			feeds = jo.toString();
			return feeds;
		}
		/**
		 * 
		 * @param user
		 * @param pwd
		 * @return success if method could create Database tables or error code
		 */
		@POST
		@Path("/createDB")
		@Produces("application/json")
		public String createDB(
				@FormParam("user")String user,
				@FormParam("pwd")String pwd)
		{
			JsonObject jo= new JsonObject();
			String feeds  = null;
			try {
				if(user.equals(PropertyManager.getAdminuser())&&pwd.equals(PropertyManager.getAdminpwd())){ 
						DatabaseConnectionManager.databaseinsert("CREATE  TABLE `Mobiam`.`users` ("+

  																	"`idusers` INT(11) ZEROFILL UNSIGNED NOT NULL AUTO_INCREMENT ,"+

  																	"`tenant` VARCHAR(45) NOT NULL ,"+

  																	"`office` VARCHAR(45) NOT NULL ,"+

  																	"`empid` VARCHAR(45) NOT NULL ,"+

  																	"`pass` VARCHAR(20) NOT NULL ,"+

  																	"`username` VARCHAR(45) NOT NULL ,"+

  																	"`attendance` TINYINT NOT NULL ,"+

  																	"`cause` VARCHAR(100) NULL ,"+

  																	"PRIMARY KEY (`idusers`) ,"+

  																	"UNIQUE INDEX `idusers_UNIQUE` (`idusers` ASC) );"

  																	);
						DatabaseConnectionManager.databaseinsert("CREATE  TABLE `mobiam`.`groups` ("+

 																" `idgroupbinding` INT UNSIGNED ZEROFILL NOT NULL AUTO_INCREMENT ,"+

 																" `readinguser` VARCHAR(45) NOT NULL ,"+

 																" `listetuser` VARCHAR(45) NOT NULL ,"+

 																" `causesallowed` TINYINT NOT NULL ,"+

	 															" PRIMARY KEY (`idgroupbinding`) );"

																);
						DatabaseConnectionManager.databaseinsert("CREATE  TABLE `mobiam`.`sessions` ("+

																	" `sessionid` VARCHAR(31) NOT NULL ,"+

																	" `userid` VARCHAR(45) NOT NULL ,"+

																	" `ip` VARCHAR(20) NULL ,"+

																	" PRIMARY KEY (`sessionid`) );");
						jo.addProperty("type", "success");
				}else{
					jo = ErrorTypeManager.seterror211();
				}
			} catch (Exception e) {
				jo = ErrorTypeManager.seterror100();
			}

			feeds = jo.toString();
			return feeds;
		}
}
