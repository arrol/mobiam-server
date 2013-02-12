//-----------------------------
//         MOBIAM-Hash
//Utility-Bibliothek für MOBIAM
//  (C) Niklas Weissner 2012
//-----------------------------

var SHA512 = {};

SHA512.getHash = function(message)
{			 
	message = message.toString();
	
	var oldLength = message.length;
	message += String.fromCharCode(0x80);//0b10000000 anhängen (Erstes angehängtes bit '1')
	
	var msgLen = message.length/4 + 2; //Länge der Nachricht in 32-Bit-Blöcken + angehängten (64 Bit) Längenblock
	
	/*//Zu ineffizient: Konvertierung in Blöcke müsste manuell erfolgen
	while((message.length*8) % 1024 != (1024-64) % 1024)
	{
		message += String.fromCharCode(0x00);//Nullen anhängen bis Länge von message kongruent zu 1024-64 mod 1024
	}*/
	
	var blockCount = Math.ceil(msgLen/16); //Anzahl der nötigen Nachrichtenblöcke
    var M = new Array(blockCount); //32-Bit Nachrichtenblöcke der Nachricht

    for (var i=0; i<blockCount; i++) 
	{
		//Übertragen der Bytes in Nachrichtenblöcke (4 Bytes pro Block)
        M[i] = new Array(16);
		
        for (var ij=0; ij<16; ij++) 
		{  
			//Zusammenfügen der Bytes zu 32-Bit-Blöcken
			//Wenn Byte ausserhalb des Bereiches ist, gibt charCodeAt NaN zurück, Bit-Ops machen daraus 0 -> Nullen zu füllung entstehen automatisch
            M[i][ij] = (msg.charCodeAt(i*64 + ij*4) << 24) | (msg.charCodeAt(i*64 + ij*4 +1) << 16) | (msg.charCodeAt(i*64 + ij*4 +2) << 8) | (msg.charCodeAt(i*64 + ij*4 +3));
        } 
    }
	M[blockCount-1][14] = (oldLength*8) / Math.pow(2,32);//MSBs anhängen (mit 64-Bit-Alternative zu >>> 32)
	M[blockCount-1][14] = Math.floor(M[blockCount-1][14]);//Entfernen von Kommas die bei der Division entstanden sein könnten
	M[blockCount-1][15] = (oldLength*8) & 0xFFFFFFFF;//LSBs anhängen
	
	//HIER fortfahren mit Kompressionsalgorithmus
};