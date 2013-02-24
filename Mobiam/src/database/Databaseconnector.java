package database;

import java.sql.DriverManager;
import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import org.springframework.core.io.FileSystemResource;
import org.springframework.beans.factory.BeanFactory;
import org.springframework.beans.factory.xml.XmlBeanFactory;

import javax.naming.InitialContext;
import javax.naming.NamingException;
import javax.sql.DataSource;
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
    		DataSource datasource;
    		
    			try 
    			{
    				InitialContext ctx = new InitialContext();
    			
					DataSource ds = (DataSource) ctx.lookup("jdbc/mysql");
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
					// TODO Auto-generated catch block
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