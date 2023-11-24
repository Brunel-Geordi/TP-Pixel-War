const express = require("express");
const http = require("http");
const websocket = require("ws");
const mysql = require("mysql");
const connection = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "YNOV",
});

connection.connect((err) => {
  if (err) {
    console.error("Erreur de connexion à la base de données : " + err.stack);
    return;
  }
  console.log("Connecté à la base de données");
});

const app = express();
const server = http.createServer(app);
const ws = new websocket.Server({ server });

ws.on("connection", (socket) => {
  connection.query(`SELECT * FROM pixel`, (err, results) => {
    if (err) {
      console.error("Erreur lors de l'exécution de la requête");
      return;
    }
    const data = results.map((row) => {
      return {
        id: `${row.Xpos},${row.Ypos}`,
        x: row.Xpos,
        y: row.Ypos,
        color: row.color,
      };
    });
    data.forEach((data) => {
      ws.clients.forEach((client) => {
        if (client.readyState === websocket.OPEN) {
          client.send(JSON.stringify({ action: "initialData", data: data }));
        }
      });
    });
  });
  socket.on("message", (m) => {
    const { action, data, msg } = JSON.parse(m);
    if (action === "draw") {
      console.log(data);

      connection.query(
        `INSERT INTO pixel(Xpos, Ypos, color) VALUES (${data.x}, ${data.y}, '${data.color}')`,
        (err, results) => {
          if (err) {
            console.error("Erreur lors de l'exécution de la requête");
            return;
          }
          console.log("Successfull");
        }
      );

      ws.clients.forEach((client) => {
        if (client.readyState === websocket.OPEN) {
          client.send(JSON.stringify({ action, data }));
        }
      });
    } else if (action === "send") {
      console.log(msg);
      ws.clients.forEach((client) => {
        if (client.readyState === websocket.OPEN) {
          client.send(JSON.stringify({ action, msg }));
        }
      });
    }
  });
});

server.listen(8080, () => {
  console.log("server listening on 8080");
});
