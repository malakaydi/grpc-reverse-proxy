const express = require('express');
const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
const bodyParser = require('body-parser');
const mysql = require('mysql');

const app = express();
const port = 5000;

// Chargement du fichier proto
const packageDefinition = protoLoader.loadSync('my-service.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
});
const myServiceProto = grpc.loadPackageDefinition(packageDefinition).myservice;

// Connexion à la base de données MySQL
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'dbuser',
  password: 'dbpass',
  database: 'db'
});

connection.connect((err) => {
  if (err) throw err;
  console.log('Connected to database');
});

// Fonction pour gérer les requêtes gRPC
function getRecord(call, callback) {
  const id = call.request.id;
  // Requête à la base de données pour obtenir le record avec l'ID spécifié
  connection.query('SELECT * FROM records WHERE id = ?', [id], (error, results) => {
    if (error) {
      console.error(error);
      callback(error);
      return;
    }
    // Renvoie les données au client gRPC
    const record = results[0];
    callback(null, { record: record.id });
  });
}

// Création du client gRPC
const grpcClient = new myServiceProto.MyService('localhost:50051', grpc.credentials.createInsecure());

// Middleware pour parser les requêtes JSON
app.use(bodyParser.json());

// Endpoint REST pour gérer les requêtes getRecord
app.get('/record/:id', (req, res) => {
  const id = req.params.id;
  grpcClient.getRecord({ id }, (err, response) => {
    if (err) {
      console.error('Error:', err);
      res.status(500).send('Internal Server Error');
      return;
    }
    res.json(response);
  });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`Reverse proxy server listening at http://localhost:${port}`);
});
