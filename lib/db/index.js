const sqlite = require('better-sqlite3');
const path = require("path"); 
const db = {}
const db_name = path.join(__dirname, "..","..","data", "data-fountains.db");
const sqliteDb = new sqlite(db_name);
//  id INTEGER PRIMARY KEY AUTOINCREMENT,
const sql_create = `CREATE TABLE IF NOT EXISTS Entries (

  position VARCHAR(100) NOT NULL,
  q REAL NOT NULL,
  date TEXT NOT NULL
);`;
const stmt = sqliteDb.prepare(sql_create);
const info = stmt.run();
// console.log(info);
db.query = (sql, params) => {
  return sqliteDb.prepare(sql).all(params);
}
db.hasTimeEntry = (data) => {
  const stmt = sqliteDb.prepare(
    `SELECT COUNT(*) as tot
    FROM Entries t1
    WHERE position= @pos AND t1.date = @dt`
    );
  const info = stmt.all({'pos':data.name, 'dt':data.dt});
  return info[0]['tot'] > 0;
}
db.insertRecord = (data) => {
  const stmt = sqliteDb.prepare('INSERT INTO Entries (position, q, date) VALUES (@name, @quality, @dt)');
  return stmt.run(data);
}
db.updateTimeEntry = (data) => {
  const stmt = sqliteDb.prepare('UPDATE Entries SET q = q + @increment WHERE position = @name AND date = @dt');
  return stmt.run({ increment:data.q, name: data.name, dt: data.dt });
}
db.reset = () => {
  const stmt = sqliteDb.prepare('DELETE FROM Entries');
  const info = stmt.run();
}

db.getAverages = () => {
  const stmt = sqliteDb.prepare('SELECT position, AVG(q) as average FROM Entries GROUP BY position');
  const info = stmt.all();
  return info;
}

db.clearPos = (pos) => {
  const stmt = sqliteDb.prepare(
    `DELETE 
    FROM Entries 
    WHERE position = @position`
    );

  const info = stmt.run({position:pos});
  return info;
}

db.getLatestData = (dt) => {
  const flatHour = dt ? new Date(dt) : new Date()
  //flatHour.setMinutes(0, 0, 0); 
   //console.log(flatHour.toISOString())
  //AND date >      
  const stmt = sqliteDb.prepare(
    `SELECT t1.*
    FROM Entries t1
    `
    );//WHERE t1.date <= @dt
  const info = stmt.all({'dt':flatHour.toISOString()});
  return info;
}

db.getAllData = () => {
  //AND date >      
  const stmt = sqliteDb.prepare(
    `SELECT t1.*
    FROM Entries t1`
    );
  const info = stmt.all();
  return info;
}

db.getLatestRecords = (n=100) => {
  if(n > 200){
    n = 200;
  }
  const stmt = sqliteDb.prepare(
    `SELECT t1.*
    FROM Entries t1
    ORDER BY t1.date DESC
    LIMIT @limit`
    );
  const info = stmt.all({'limit': n});
  return info;
}

db.clearOldEntries = () => {
  const stmt = sqliteDb.prepare(
    `DELETE 
    FROM Entries 
    WHERE date < date('now','-1 month')`
    );

  const info = stmt.run();
  return info;
  // return true;
}

module.exports = db;
