package database;

import java.sql.DriverManager;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
/**
 * 
 * @author j-lorra
 *
 */
public class Databaseconnector {
	//database request with String return for reading data
	/**
	 * 
	 * @param request -SQL request-
	 * @param answers -Number of data per dataset-
	 * @return String -Database response data separated with ',' and dataset with ';'-
	 */
	public static String databaserequest(String request,int answers) {
			
			Connection con = null;
    		String answer ="";
    		
    			try 
    			{
    				con = DriverManager.getConnection("jdbc:mysql://localhost:3306/database", "root","Lindenhof52");
    				Statement stmt = con.createStatement();
    				try{
    					ResultSet rs = stmt.executeQuery(request);
    					while(rs.next()){
        					int i=1;
        					while(i<=answers){
        						answer+= rs.getString(i++)+",";
        					}
        					answer+=";";
        				}
    					stmt.close();
        				rs.close();  
    				}catch(SQLException e){
    					e.printStackTrace();
        				answer ="fehler bei der abfrage";
    					
    				}
    				
    				
    				  				
    			}catch(SQLException e)
    			{
    				e.printStackTrace();
    				answer ="fehler mit Db verbindung";
    				
    			}
    			finally
    			{
    				if(con != null)
    					try {con.close();} catch (SQLException e){ e.printStackTrace();}
    			}

			return answer;
	}
	/**
	 * 
	 * @param request SQL Request
	 * @return int status code -500 connection error -200request error
	 */
	//database request with int return for checking success
	public static int databaseinsert(String request) {
		int r=0;
		Connection con = null;
		
			try 
			{
				con = DriverManager.getConnection("jdbc:mysql://localhost:3306/database", "root","Lindenhof52");
				Statement stmt = con.createStatement();
				
				
				try{
					stmt.executeUpdate(request);
				}catch(SQLException e){
					r= -200;
				}
				stmt.close();    				
			}catch(SQLException e)
			{
				e.printStackTrace();
				r=-500;
			}
			finally
			{
				if(con != null)
					try {con.close();} catch (SQLException e){ e.printStackTrace();}
			}

			return r;
	}
	
}