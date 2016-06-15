/**
 * Created by MMo2 on 6/14/2016.
 */

var DB = require('../helpers/dbHelper');

exports.create = function(name, text, callback) {
    let db = DB.get()
    db.collection("foods").insert({name: name, text: text}, function(err, result) {
        if (err) return callback(err);
        callback(null, result.insertedIds[0]);
    })
}

exports.all = function(callback) {
    let db = DB.get();
    db.collection("foods").find().toArray(callback);
}

exports.remove = function(id, callback) {
    let db = DB.get();
    db.collection("foods").removeOne({_id:id}, function(err, result) {
        callback(err);
    })
}