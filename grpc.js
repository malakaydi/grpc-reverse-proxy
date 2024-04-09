const grpc = require('@grpc/grpc-js');
const protoLoader = require('@grpc/proto-loader');
// charge le service grpc et le fichier.proto
const PROTO_PATH = __dirname + '/my-service.proto';
const packageDefinition = protoLoader.loadSync(PROTO_PATH);
const serviceProto = grpc.loadPackageDefinition(packageDefinition).myservice;
// Définit le service grpc
const myService = {
getRecord: (call, callback) => {
const id = call.request.id;
const record = `Record ${id}`;
callback(null, { record });
},
};
// Démarre le serveur grpc
const server = new grpc.Server();
server.addService(serviceProto.MyService.service, myService);
server.bindAsync(
'127.0.0.1:50051',
grpc.ServerCredentials.createInsecure(),
() => { console.log('listening on port 50051');
server.start()}
)