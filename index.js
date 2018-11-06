const express = require('express');
const fs = require('fs'); 
const path    = require("path");
var app = express();
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const MongoClient = require('mongodb').MongoClient;

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


const objectsValue = [
    {path:'/user/', name:'User', fields: [ 'id', 'name', 'password'] },
    {path:'/items/', name:'Items', fields: [ 'id', 'label', 'image', 'description']},
    {path:'/list/', name:'List', fields: ['id', 'name', 'user', 'items']}
];


const url = 'mongodb://localhost:27017';
const dbName = 'db';

const client = new MongoClient(url, {useNewUrlParser: true});

client.connect()
    .then(connectedClient => {
        const db = connectedClient.db(dbName);
        runObjectFor(db);
    })
    .catch(err => {
        console.error('fail to connect to mongodb :'+url);
        app.get('/*', function (req, res) {
            return res.status(500).send('DataBase Error!');
        });
        throw err
    });
    // connectedClient.db(dbname).collection('user').insertmany


function writeLog(mode, name, uid){
    fs.writeFile('log.log', new Date()+' - '+mode+' '+name+' by '+uid+'\n\r', { flag: 'a+' }, (err) => {});
}

function runObjectFor(db){
    objectsValue.forEach(objectvalue => {

        app.get(objectvalue.path, function (req, res) {
            var content = fs.readFileSync(objectvalue.name+".json");
            var jsonContent = JSON.parse(content);
        
            return res.send(jsonContent);
        });

        app.use(objectvalue.path+'create', function (req, res, next){writeLog('Create new', objectvalue.name, req.sessionID);next();});
        app.use(objectvalue.path+'delete', function (req, res, next) {writeLog('Delete', objectvalue.name, req.sessionID);next();});
        app.use(objectvalue.path+'update', function (req, res, next) {writeLog('Update', objectvalue.name, req.sessionID);next();});
        app.use(objectvalue.path, function (req, res, next) {writeLog('Show list of', objectvalue.name, req.sessionID);next();});
        
        app.post(objectvalue.path, function (req, res) {
            var documents = db.collection(objectvalue.name).find().toArray(function (error, results){
                return res.send(JSON.stringify(results));
            });
        });

        app.post(objectvalue.path+'create', function (req, res) {

            var creatObject={};
            objectvalue.fields.forEach(field => {
                creatObject[field] = req.body[field];
            });
            
            db.collection(objectvalue.name).insertOne(creatObject, null, function (error, results) {
                if (error) throw error;
                return res.send(creatObject);
            });
        });

        app.post(objectvalue.path+'delete', function (req, res) {
            var creatObject={};
            objectvalue.fields.forEach(field => {
                if(req.body[field])
                    creatObject[field] = req.body[field];
            });

            db.collection(objectvalue.name).find(creatObject).toArray(function (error, results){
                var objectDeleted = [];
                results.forEach(element => {
                    objectDeleted.push(element);
                    db.collection(objectvalue.name).deleteOne(element);
                });
               
                return res.send(JSON.stringify(objectDeleted));
            });
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
}

