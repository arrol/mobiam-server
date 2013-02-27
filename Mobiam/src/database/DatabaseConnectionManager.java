package database;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;
/**
 * 
 * @author j-lorra
 *
 */
public class DatabaseConnectionManager {
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
    				InitialContext ctx = new InitialContext();
    			
					DataSource ds = (DataSource) ctx.lookup("java:app/jdbc/Mobiam_pool");
					con = ds.getConnection();
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
    				}catch(SQLException  e){
    					e.printStackTrace();
        				answer ="fehler bei der abfrage";
    					
    				}
    				
    				
    				  				
    			}catch(SQLException e)
    			{
    				e.printStackTrace();
    				answer ="fehler mit Db verbindung";
    				
    			} catch (NamingException e1) {
					e1.printStackTrace();
					answer = "couldnt load datapool from server";
				}
    			finally
    			{
    				if(con != null)
    					try {con.close();} catch (SQLException e){ e.printStackTrace();}
    			}

			return answer;
	}
	public static String databaseinsert(String request) {
		
		Connection con = null;
		String answer ="";
		
			try 
			{
				InitialContext ctx = new InitialContext();
			
				DataSource ds = (DataSource) ctx.lookup("java:app/jdbc/Mobiam_pool");
				con = ds.getConnection();
				java.sql.PreparedStatement stmt = con.prepareStatement(request);
				stmt.execute();	
				stmt.close();    				
			}catch(SQLException e)
			{
				e.printStackTrace();
				answer ="fehler mit Db verbindung";
				
			} catch (NamingException e1) {
				e1.printStackTrace();
				answer = "couldnt load datapool from server";
			}
			finally
			{
				if(con != null)
					try {con.close();} catch (SQLException e){ e.printStackTrace();}
			}

		return answer;
}


}