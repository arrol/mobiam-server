package util;

import com.google.gson.JsonObject;

public class ErrorTypeManager {
	/**
	 * 
	 * @param jo set error message Bad session Error 102 into JSONObject
	 * 
	 */
 public static void seterror102(JsonObject jo){
	 	jo.addProperty("type", "error");
		jo.addProperty("message", "Bad session!");
		jo.addProperty("errorID", 102);
 }
 /**
  * 
  * @param jo set error message Intern Error 114 into JSONObject
  *
  */
 public static void seterror114(JsonObject jo){
	 	jo.addProperty("type", "error");
		jo.addProperty("message", "Intern Error!");
		jo.addProperty("errorID", 114);
}
 /**
  * 
  * @param jo set error message Bad login data Error 110 into JSONObject
  *
  */
 public static void seterror110(JsonObject jo){
	 	jo.addProperty("type", "error");
		jo.addProperty("message", "Bad login data!");
		jo.addProperty("errorID", 110);
}
 /**
  * 
  * @param jo set error message Bad ADMIN Login Error 111 into JSONObject
  *
  */
 public static void seterror111(JsonObject jo){
	 	jo.addProperty("type", "error");
		jo.addProperty("message", "Bad ADMIN Login!");
		jo.addProperty("errorID", 111);
}
 /**
  * 
  * @param jo set error message Bad dataset Error 100 into JSONObject
  *
  */
 public static void seterror100(JsonObject jo){
	 	jo.addProperty("type", "error");
		jo.addProperty("message", "Bad Dataset!");
		jo.addProperty("errorID", 111);
}
}
