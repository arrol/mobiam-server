package util;

import java.security.MessageDigest;
import java.security.NoSuchAlgorithmException;

public class Sha256Factory {
	
	public static String StringTosha256Hex(String ini)
	{
	MessageDigest md;
	char[] hexChars={};
	try {
		md = MessageDigest.getInstance("SHA-256");
	
	md.update(ini.getBytes());
	byte[] bytes = md.digest();
	final char[] hexArray = {'0','1','2','3','4','5','6','7','8','9','a','b','c','d','e','f'};
	hexChars = new char[bytes.length * 2];
	int v;
	for ( int j = 0; j < bytes.length; j++ )
	{
	v = bytes[j] & 0xFF;
	hexChars[j * 2] = hexArray[v >>> 4];
	hexChars[j * 2 + 1] = hexArray[v & 0x0F];
	}
	} catch (NoSuchAlgorithmException e) {
		e.printStackTrace();
	}
	return new String(hexChars);
	}
}
