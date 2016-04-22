var http = require("http");
var express = require("express");

var app = express();

var server  = http.createServer(app);
var data = require("./data.js")


app.get("/boxes",function(req,res){
    var books = data.getBooks();
    var booksData = data.getBookData(books);
    var boxes = data.createBoxes(booksData);

    res.setHeader('Content-Type', 'application/json');
    res.send(JSON.stringify(boxes));
    console.log(boxes);
})

server.listen('3000');
