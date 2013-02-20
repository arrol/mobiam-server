package webService;

import database.Databaseconnector;
//class generates data for json response list
public class Employee {
	

	public String id="";
    public String name="";
    public boolean attendance=false;
    public String cause="";

    Employee(String userid,String causeallowed){
    	
    	//select user information by id
    	String user= Databaseconnector.databaserequest("Select username, empid, attendance, cause from database.users where idusers like '"+userid+"'",4);
    	String data[]= user.split(",");
    	name = data[0];
    	id = data[1];
    	
    	//translate numbers into boolean
    	if(data[2].equals("1"))attendance=true;
    	else attendance = false;
    	//check if watching user is allowed to see causes
    	if(causeallowed.equals("1"))cause = data[3];
	    };

}
