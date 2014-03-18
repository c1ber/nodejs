var config=require('../config/');
var MongoClient = require('mongodb').MongoClient;
var Synergy=require('../libraries/synergy');
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
        var processed= 0,success_count= 0,failed_count=0;

        synergy.send(message.to, message.msg,function(status){
            processed++;
            if(status==0)
                failed_count++;
            else
                success_count++;
            if(processed==messages.length)
                callback({success_count:success_count,failed_count:failed_count});
        });
    }
}

exports.send = function(req, res){
    authenticate({api_key:req.body.api_key,api_secret:req.body.api_secret},
        function(){
            send(req.body.messages,function(sent){
                res.json({total:req.body.messages.length,success:sent.success_count,failed:sent.failed_count});
            });
        },
        function(){
            res.json({error:'Auth Error!'});
        }
    );
}