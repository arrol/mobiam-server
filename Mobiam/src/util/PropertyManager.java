package util;

public class PropertyManager {
	private final static String ADMINUSER="root";
	private final static String ADMINPWD="mobiamadmin";
	private final static int SESSIONTIME = 120;
	public static String getAdminuser() {
		return ADMINUSER;
	}
	public static String getAdminpwd() {
		return ADMINPWD;
	}
	public static int getSessiontime() {
		return SESSIONTIME;
	}
}
