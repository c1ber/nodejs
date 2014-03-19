var config=require('../config/');
var MongoClient = require('mongodb').MongoClient;
var Synergy=require('../libraries/Synergy');
var Airtel=require('../libraries/Airtel');
/*
 * GET home page.
 */

exports.index = function(req, res){
    res.send(200,'SMS Gateway API!');
}

exports.create = function(req, res){
    MongoClient.connect(config.mongo.connection, function(err, db) {
        if(err) throw err;
        db.collection('clients').update({api_key: '1'},{$set:{name: 'kaal',api_key: '1',api_secret: '1028c3247c0e2d2496fd220984d419e8'}}, {upsert:true}, function(err, objects) {
            if(err) throw err;
            res.end('created!');
        });
    });
}

function authenticate(cred,success,fail){
    MongoClient.connect(config.mongo.connection, function(err, db) {
        if(err) throw err;
        var collection = db.collection('clients');
        collection.findOne({api_key: cred.api_key,api_secret:cred.api_secret},function(err, item){
            if(item)
                success();
            else
                fail();

        });
    });
}

function send(messages,callback){
    var synergy=new Synergy(config.synergy.api_key,config.synergy.api_secret);
    for(i in messages){
        var message=messages[i];
        var processed= 0,success= 0,failed=0;

        synergy.send(message.to, message.msg,function(status){
            processed++;
            if(status==0)
                failed++;
            else
                success++;
            if(processed==messages.length)
                callback({total:messages.length,success:success,failed:failed});
        });
    }
}

function showReport(api_key,day,month,year,callback){

}

function addReport(api_key,day,month,year,report,callback){
    MongoClient.connect(config.mongo.connection, function(err, db) {
        if(err) throw err;
        db.collection('reports').update({api_key: api_key,day:day,month:month,year:year},{$inc:report}, {upsert:true}, function(err, objects) {
            if(err) throw err;
        });
    });
}

exports.send = function(req, res){
    var api_key=req.body.api_key;
    var api_secret=req.body.api_secret;
    authenticate({api_key:api_key,api_secret:api_secret},
        function(){
            send(req.body.messages,function(report){
                var date=new Date;
                addReport(api_key,date.getDay(),date.getMonth()+1,date.getFullYear(),report);
                res.json(report);
            });
        },
        function(){
            res.json({error:'Auth Error!'});
        }
    );
}

exports.report = function(req, res){
    var api_key=req.body.api_key;
    var api_secret=req.body.api_secret;
    authenticate({api_key:api_key,api_secret:api_secret},
        function(){
            report(api_key,day,month,year,function(report){
                res.json(report);
            });
        },
        function(){
            res.json({error:'Auth Error!'});
        }
    );
}