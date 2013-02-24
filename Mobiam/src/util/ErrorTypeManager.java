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
  * @param jo set error message Intern Error 114 into JSONObject
  *
  */
 public static JsonObject seterror114(){
	 JsonObject jo = new JsonObject();
	 	jo.addProperty("type", "error");
		jo.addProperty("message", "Intern Error!");
		jo.addProperty("errorID", 114);
		return jo;
}
 /**
  * 
  * @param jo set error message Bad login data Error 110 into JSONObject
  *
  */
 public static JsonObject seterror110(){
		JsonObject jo = new JsonObject();
	 	jo.addProperty("type", "error");
		jo.addProperty("message", "Bad login data!");
		jo.addProperty("errorID", 110);
		return jo;
}
 /**
  * 
  * @param jo set error message Bad ADMIN Login Error 111 into JSONObject
  *
  */
 public static JsonObject seterror111(){
		JsonObject jo = new JsonObject();
	 	jo.addProperty("type", "error");
		jo.addProperty("message", "Bad ADMIN Login!");
		jo.addProperty("errorID", 111);
		return jo;
}
 /**
  * 
  * @param jo set error message Bad dataset Error 100 into JSONObject
  *
  */
 public static JsonObject seterror100(){
	 	JsonObject jo = new JsonObject();
	 	jo.addProperty("type", "error");
		jo.addProperty("message", "Bad Dataset!");
		jo.addProperty("errorID", 111);
		return jo;
}
}
