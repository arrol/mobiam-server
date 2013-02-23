package webService;

import database.Databaseconnector;
//class generates data for json response list
/**
 * 
 * @author j-lorra
 */
public class Employee {
	
	public String type ="";
	public String message;
	public String errorID;
	public String id;
    public String name;
    public boolean attendance;
    public String cause;
    /**
     * 
     * @param userid
     * @param causeallowed
     * @return Data Transfer Object User
     */
    Employee(String userid,String causeallowed){
    	
    	//select user information by id
    	String user= Databaseconnector.databaserequest("Select username, empid, attendance, cause from database.users where idusers like '"+userid+"'",4);
    	String data[]= user.split(",");
    	try{
    		type= "success";
	    	name = data[0];
	    	id = data[1];
	    	//translate numbers into boolean
	    	if(data[2].equals("1"))attendance=true;
	    	else attendance = false;
	    	//check if watching user is allowed to see causes
	    	if(causeallowed.equals("1"))cause = data[3];
	    
    	}catch(Exception e){
    		
    	}
    };

}
