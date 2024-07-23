import { Client } from '@stomp/stompjs';
import { WebSocket } from 'ws';
Object.assign(global, { WebSocket });

const ROOM_ID = 1;

const client = new Client({
    // brokerURL: 'wss://i11a410.p.ssafy.io/staging/ws',
    brokerURL: 'wss://localhost:8080/staging/ws',
    onConnect: () => {
        console.log('boom');
        client.subscribe(`/topic/rooms/${ROOM_ID}/players/position`, message => {
            console.log(`received: ${message.body}`);
        })

        client.publish({
            destination: `/ws/rooms/${ROOM_ID}/players/position`,
            body: {
                requestId: null,
                x: 1,
                y: 2,
                direction: 'LEFT'
            }
        })
    }
})

client.activate();
export default client;