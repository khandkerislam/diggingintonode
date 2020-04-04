#!/usr/bin/env node 

"use strict"

var util = require("util");
var path = require("path");
var fs = require("fs");
var Transform = require("stream").Transform;
var zlib = require("zlib");

var args = require("minimist")(process.argv.slice(2), {
    boolean: [ "help", "in", "out", "compress" ], 
    string: [ "file" ]
});

var BASE_PATH = path.resolve( 
    process.env.BASE_PATH || __dirname
);

if (args.help) {
    printHelp();
}
else if (args.in || args._.includes("-"))
{
    processFile(process.stdin);
}
else if (args.file){
    let stream = fs.createReadStream(path.join(BASE_PATH,args.file));
    processFile(stream);
    fs.readFile(path.join(BASE_PATH,args.file),function onContents(err,contents){
        if(err){
            error(err.toString());
        }
        else
        {
            processFile(contents);
        }
    });
}
else {
    error("Incorrect usage.", true);
}

// *********************

function processFile(inStream){
    var outStream = inStream;

    var upperStream = new Transform({
        transform(chunk,enc,cb){
            this.push(chunk.toString().toUpperCase());
            setTimeout(cb, 500);
            cb();
        }
    });

    outStream = outStream.pipe(upperStream);

    if (args.compress) {
        let gzipStream = zlib.createGzip();
        outStream = outStream.pipe(gzipStream);
        OUTSTREAM = `${OUTFILE}.gz`;
    }

    var targetStream;
    if (args.out) {
        targetStream = process.stdout;
    }
    else {
        targetStream = fs.createWriteStream(OUTFILE);
    }
}

function error(msg, includeHelp = false) {
    console.error(msg);
    if (includeHelp) {
        console.log("");
        printHelp();
    }
}

function printHelp() {
    console.log("ex1 usage:")
    console.log(" ex1.js --help");
    console.log("");
    console.log("--help             print this help");
    console.log("--file={FILENAME}  process the file");
    console.log("--in, -            process stdin");
    console.log("--out              print to stdout");
    console.log("--compress         gzip the output");
    console.log("");
}