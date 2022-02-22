import 'dotenv/config' 
import express from "express"
import http from "http"
import { Server } from "socket.io";
import { EventHubConsumerClient } from "@azure/event-hubs"
import { ContainerClient } from "@azure/storage-blob"  
import { BlobCheckpointStore } from "@azure/eventhubs-checkpointstore-blob"
import index from "./routes/index.js";

const port = process.env.PORT || 4001;

const app = express();

app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    next();
});

const httpServer = http.createServer(app);
const io = new Server(httpServer, {
    cors: {
      origin: ["http://localhost:3000"]
    }
  });

io.on('connection', (socket) => {
    async function main() {
        // Create a blob container client and a blob checkpoint store using the client.
        const containerClient = new ContainerClient(process.env.STORAGE_CONNECTION_STRING, process.env.CONTAINER_NAME);
        const checkpointStore = new BlobCheckpointStore(containerClient);
      
        // Create a consumer client for the event hub by specifying the checkpoint store.
        const consumerClient = new EventHubConsumerClient(process.env.CONSUMER_GROUP, process.env.CONNECTION_STRING, process.env.EVENT_HUB_NAME, checkpointStore);
      
        // Subscribe to the events, and specify handlers for processing the events and errors.
        const subscription = consumerClient.subscribe({
            processEvents: async (events, context) => {
              if (events.length === 0) {
                console.log(`No events received within wait time. Waiting for next interval`);
                return;
              }
              for (const event of events) {
                // console.log(`Received event: '${event.body}' with message ID: '${event.messageId}' from partition: '${context.partitionId}' and consumer group: '${context.consumerGroup}'`);
                // console.log(JSON.stringify(event.body));
                io.emit('chat message', event.body);
                console.log('message: ' + JSON.stringify(event.body));
              }
              // Update the checkpoint.
              await context.updateCheckpoint(events[events.length - 1]);
            },
            processError: async (err, context) => {
              console.log(`Error : ${err}`);
            }
            
          }
        );
      }
      main().catch((err) => {
        console.log("Error occurred: ", err);
      });
});

httpServer.listen(port, () => {
  console.log(`Listening on port ${port}.`)
});