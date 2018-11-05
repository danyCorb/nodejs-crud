const express = require('express');
var fs = require('fs'); 
var path    = require("path");
const app = express();
var bodyParser = require('body-parser');
var jwt = require('jsonwebtoken');

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


var objectsValue = [
    {path:'/user/', name:'User', fields: [ 'id', 'name', 'password'] },
    {path:'/items/', name:'Items', fields: [ 'id', 'label', 'image', 'description']},
    {path:'/list/', name:'List', fields: ['id', 'name', 'user', 'items']}
];

var algo = {
    "alg": "HS512",
    "typ": "JWT"
  };
var payload = {
    "sub": "danyRight",
    "name": "dany",
    "admin": true, 
    "iat": 1541431715
  };

  var password = "ctyuslrbimèy__zanovgy_lqsn_vlncgudtwmvv!buglicbf:ugfnk;ukwtgvynksnob:divhngy;fsxty,gdxj:gbuhlcdgbnfg:u";
  var code = "eyJhbGciOiJIUzUxMiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiYWRtaW4iOnRydWUsImlhdCI6MTUxNjIzOTAyMn0.DuN8Xs4-qXJLTsQZvdBg-yl5d8szlySO0ALkAH930tQIe9_4WEDe6BadvRYAe61vB5C3ybDoyFLUYcJBum_7Zg";
    
  

function saveFile(objectName, content, returnValue, res){
    fs.writeFile(objectName+'.json', JSON.stringify(content), (err) => {  
        if (err)  {
            return res.send("Saving error");
        }
        return res.send(returnValue);
    });
}

function writeLog(mode, name, uid){
    fs.writeFile('log.log', new Date()+' - '+mode+' '+name+' by '+uid+'\n\r', { flag: 'a+' }, (err) => {});
}

objectsValue.forEach(objectvalue => {

   

    app.get(objectvalue.path, function (req, res) {
        var content = fs.readFileSync(objectvalue.name+".json");
        var jsonContent = JSON.parse(content);
    
        return res.send(jsonContent);
    });

    app.use(objectvalue.path+'create', function (req, res, next){console.log("log:"+req.sessionID);writeLog('Create new', objectvalue.name, req.sessionID);next();});
    app.use(objectvalue.path+'delete', function (req, res, next) {writeLog('Delete', objectvalue.name, req.sessionID);next();});
    app.use(objectvalue.path+'update', function (req, res, next) {writeLog('Update', objectvalue.name, req.sessionID);next();});
    app.use(objectvalue.path, function (req, res, next) {writeLog('Show list of', objectvalue.name, req.sessionID);next();});
    
    app.post(objectvalue.path, function (req, res) {
        var content = fs.readFileSync(objectvalue.name+".json");
        var jsonContent = JSON.parse(content);
    
        return res.send(jsonContent);
    });

    app.post(objectvalue.path+'create', function (req, res) {
        //console.log(req.sessionID);
        var codeGenerated = HMACSHA512(
            base64UrlEncode(algo) + "." +
            base64UrlEncode(payload),password)
        console.log(codeGenerated);

        var creatObject={};
        objectvalue.fields.forEach(field => {
            creatObject[field] = req.body[field];
        });
        var content = fs.readFileSync(objectvalue.name+".json");
        var jsonContent = JSON.parse(content);
        creatObject.id = jsonContent.length;
        jsonContent.push(creatObject)
        saveFile(objectvalue.name, jsonContent, JSON.stringify(creatObject), res);
    });

    app.post(objectvalue.path+'delete', function (req, res) {
        var creatObject={};
        objectvalue.fields.forEach(field => {
            creatObject[field] = req.body[field];
        });

        var content = fs.readFileSync(objectvalue.name+".json");
        var jsonContent = JSON.parse(content);
        
        jsonContent.forEach(function(arrayObject) {
            if(arrayObject.id == creatObject.id){
                creatObject = arrayObject;
                var index = jsonContent.indexOf(arrayObject);
                jsonContent.splice(index, 1);
            }
        });
        
        saveFile(objectvalue.name, jsonContent, creatObject, res);
    });

    app.post(objectvalue.path+'update', function (req, res) {
        var creatObject={};
        objectvalue.fields.forEach(field => {
            if(req.body[field])
                creatObject[field] = req.body[field];
        });

        var content = fs.readFileSync(objectvalue.name+".json");
        var jsonContent = JSON.parse(content);
        
        jsonContent.forEach(function(arrayUser) {
            if(arrayUser.id == creatObject.id){
                objectvalue.fields.forEach(field => {
                    if(req.body[field])
                        arrayUser[field] = req.body[field];
                });
            }
        });
        
        saveFile(objectvalue.name, jsonContent, JSON.stringify(creatObject), res);
    });
});

app.get('/', function (req, res) {
    return res.send('/user/ | /items/ | /list/');
});

app.listen(9999, () => {
    console.log('Start at 9999');
});

