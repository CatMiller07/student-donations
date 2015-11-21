/*
*************MySQL Connection stuff******************
*/
var mysql = require('mysql');
var connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: '',
	database: 'fundraising_app'
});
connection.connect();

/*
    Express template
*/
var port = 9001;
var express = require('express');
var app = express();
var bodyParser = require("body-parser");


//purpose of this is to enable cross domain requests
app.use(function(req, res, next){
	res.header("Access-Control-Allow-Origin", "*");
	next();
});
app.use(    bodyParser.urlencoded( {extended: true})    );

app.get('/transactions', function(req,res){
	connection.query("SELECT sid, ROUND(sum(donation),2) as totl FROM transactions group by sid", function(err, rows){
        if (!err){
		    console.log('the solution is: ',rows);
            res.setHeader("Content-Type", "application/json");
			res.end(JSON.stringify(rows));//Important! this is how you actually
                                          //send back a response
        }else{
            console.log("There was an eror in the query");
        }
    });
});

app.get('/bygrade/:grade', function(req,res){
    var grade = req.params.grade;
    var dynSelect = "SELECT L.sid,L.fname,L.lname,round(sum(c.donation),2) as totl"+
		             "  FROM(SELECT a.sid,a.fname,a.lname,b.grade from students a" +
		             "  JOIN sections b on a.section_id = b.section_id) as l join transactions c " +
		             " on l.sid = c.sid  " + 
					 " where l.grade = '" + grade + "'  Group by l.sid,l.fname,l.lname" ;
	    console.log(dynSelect);
    connection.query( dynSelect,function(err,rows){       	
					 
        if (err){
            console.log("DB query failed: "+error);
            res.end("DB error");
        }
        else{
            console.log("DB query succeeded"+rows);
			res.setHeader("Content-Type", "application/json");
            res.end(JSON.stringify(rows));
        }
    });
});

app.post('/transactions/:sid/:donation', function(req, res){
    var sid = req.params.sid;
    var donation = req.params.donation;
    connection.query("INSERT INTO transactions (sid, donation) VALUES"+
                    " ("+sid+", "+donation+")", function(error){
        if (error){
            console.log("DB insertion failed: "+error);
            res.end("DB error");
        }
        else{
            console.log("DB insertion succeeded");
            res.end("Success");
        }
    });
});


app.listen(port);
console.log("Server listening on port "+port);

