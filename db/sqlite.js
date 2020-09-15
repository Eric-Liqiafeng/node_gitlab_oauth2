
var fs = require('fs');
var sqlite3 = require('sqlite3').verbose();

var DB = DB || {};

DB.SqliteDB = function (file) {
    DB.db = new sqlite3.Database(file);

    DB.exist = fs.existsSync(file);
    if (!DB.exist) {
        console.log("Creating db file!");
        fs.openSync(file, 'w');
    };
};

DB.printErrorInfo = function (err) {
    console.log("Error Message:" + err.message + " ErrorNumber:" + errno);
};

DB.SqliteDB.prototype.createTable = function (sql) {
    DB.db.serialize(function () {
        DB.db.run(sql, function (err) {
            if (null != err) {
                DB.printErrorInfo(err);
                return;
            }
        });
    });
};

/// tilesData format; [[level, column, row, content], [level, column, row, content]]
DB.SqliteDB.prototype.insertManyData = function (sql, objects) {
    DB.db.serialize(function () {
        var stmt = DB.db.prepare(sql);
        for (var i = 0; i < objects.length; ++i) {
            stmt.run(objects[i]);
        }
        stmt.finalize();
    });
};


DB.SqliteDB.prototype.insertOneData = function (sql, objects, callback) {
    DB.db.serialize(function () {
        DB.db.run(sql,objects, function (err, data) {
            callback(err, data);
        });
    });
};

DB.SqliteDB.prototype.queryData = function (sql, callback) {
    DB.db.all(sql, function (err, rows) {
        if (null != err) {
            DB.printErrorInfo(err);
            return;
        }
        /// deal query data.
        if (callback) {
            callback(err, rows);
        }
    });
};

DB.SqliteDB.prototype.queryOneData = function (sql, params, callback) {
    DB.db.get(sql,params,function (err, row) {
        if (null != err) {
            DB.printErrorInfo(err);
            return;
        }
        if (callback) {
            callback(err, row);
        }
    });
}

DB.SqliteDB.prototype.deleteSqlById = function (sql, id, callback) {
    DB.db.run(sql, id, function (err, data) {
        callback(err, data);
    });
};

DB.SqliteDB.prototype.executeSql = function (sql,params,callback) {
    DB.db.run(sql,params,function (err,data) {
            callback(err,data);
    });
};

DB.SqliteDB.prototype.close = function () {
    DB.db.close();
};

/// export SqliteDB.
exports.SqliteDB = DB.SqliteDB;
