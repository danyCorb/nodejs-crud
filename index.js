const express = require('express');
var fs = require('fs'); 
var path    = require("path");
const app = express();
var bodyParser = require('body-parser');


app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies


var objectsValue = [
    {path:'/user/', name:'User', fields: [ 'id', 'name', 'password'] },
    {path:'/items/', name:'Items', fields: [ 'id', 'label', 'image', 'description']},
    {path:'/list/', name:'List', fields: ['id', 'name', 'user', 'items']}
];


app.use('*items/create*', function (req, res, next) {console.log('Create new Items');next();});
app.use('*list/create*', function (req, res, next) {console.log('Create new List');next();});

function saveFile(objectName, content, returnValue, res){
    fs.writeFile(objectName+'.json', JSON.stringify(content), (err) => {  
        if (err)  {
            return res.send("Saving error");
        }
        return res.send(returnValue);
    });
}

objectsValue.forEach(objectvalue => {

    app.use(objectvalue.path+'create', function (req, res, next) {console.log(new Date()+' - Create new '+objectvalue.name);next();});
    app.use(objectvalue.path+'delete', function (req, res, next) {console.log(new Date()+' - Delete '+objectvalue.name);next();});
    app.use(objectvalue.path+'update', function (req, res, next) {console.log(new Date()+' - Update '+objectvalue.name);next();});
    app.use(objectvalue.path, function (req, res, next) {console.log(new Date()+' - Shwo list of '+objectvalue.name);next();});

    app.get(objectvalue.path, function (req, res) {
        var content = fs.readFileSync(objectvalue.name+".json");
        var jsonContent = JSON.parse(content);
    
        return res.send(jsonContent);
    });
    
    app.post(objectvalue.path, function (req, res) {
        var content = fs.readFileSync(objectvalue.name+".json");
        var jsonContent = JSON.parse(content);
    
        return res.send(jsonContent);
    });

    app.post(objectvalue.path+'create', function (req, res) {
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

