package util;

import com.google.gson.JsonObject;

public class ErrorTypeManager {
/**
 * 
 * @param jo set error message Bad session Error 102 into JSONObject
 * 
 */
 public static JsonObject seterror102(){
	 	JsonObject jo = new JsonObject();
	 	jo.addProperty("type", "error");
		jo.addProperty("message", "Bad session!");
		jo.addProperty("errorID", 102);
		return jo;
 }
 /**
  * 
  * @param jo set error message Intern Error 100 into JSONObject
  *
  */
 public static JsonObject seterror100(){
	 JsonObject jo = new JsonObject();
	 	jo.addProperty("type", "error");
		jo.addProperty("message", "Interner Fehler!");
		jo.addProperty("errorID", 100);
		return jo;
}
 /**
  * 
  * @param jo set error message Bad login data Error 210 into JSONObject
  *
  */
 public static JsonObject seterror210(){
		JsonObject jo = new JsonObject();
	 	jo.addProperty("type", "error");
		jo.addProperty("message", "Bad login data!");
		jo.addProperty("errorID", 210);
		return jo;
}
 /**
  * 
  * @param jo set error message Bad ADMIN Login Error 211 into JSONObject
  *
  */
 public static JsonObject seterror211(){
		JsonObject jo = new JsonObject();
	 	jo.addProperty("type", "error");
		jo.addProperty("message", "Bad ADMIN Login!");
		jo.addProperty("errorID", 211);
		return jo;
}
 /**
  * 
  * @param jo set error message Bad dataset Error 100 into JSONObject
  *
  */
 public static JsonObject seterror200(){
	 	JsonObject jo = new JsonObject();
	 	jo.addProperty("type", "error");
		jo.addProperty("message", "Bad Dataset!");
		jo.addProperty("errorID", 200);
		return jo;
}
}
