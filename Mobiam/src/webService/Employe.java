package webService;

import java.util.Random;

import com.google.gson.JsonObject;

public class Employe {
	static String example_causes[]={
			"Krankgeschrieben",
			"Beurlaubt",
			"Auf Fortbildung",
			"In Betriebsratsitzung"
			};
	static String example_names[]={
			"Kuno Klenk",
			"Moritz Reimann",
			"Peter Bishop",
			"Kuno M&auml;rz",
			"Frank Joachim Walter",
			"Adolf Nebel",
			"Karla Wei&szlig;dorn",
			"Willi Weizel",
			"Elizabeth von Tottington",
			"Kurt Brakelmann",
			"Mark Salzh&uuml;gel",
			"Heinrich Neus&uuml;&szlig;",
			"Isaac Gates",
			"Henry Smith",
			"Henry Smith Jr.",
			"Nicholas Cage",
			"Ivan Minsk",
			"Ulfric Sturmmantel",
			"Pelagius Septim",
			"Samus Aran",
			"Birgit Bohler",
			"Saturo Iwata",
			"Rolf Transistorig",
			"Giuseppe Zamboni",
			"Anna Lehmann",
			"Bernd Asbeck",
			"Carl Gustav Alt",
			"Dorothea Apfelberger",
			"Doris Lessing",
			"Earl Charles Grey",
			"Erika Neumann",
			"Egon Grenz",
			"Grace Hopper",
			"Hans Maulwurf",
			"Klaus B&uuml;chner",
			"Lara Riebmann",
			"Martin Molte",
			"Norbert Schmidt",
			"Otto von Freiburg",
			"Paul Zimmermann"
			};

    public String name;
    public int id;
    public String cause="";
    public boolean attendance;
    
    Employe(String name){
    	this.name = name;
    	Random random = new Random();
        id = random.nextInt(10000);
         attendance = random.nextBoolean();
			if(!attendance ){
				cause =  example_causes[random.nextInt(example_causes.length)];
		}

	    };

}
