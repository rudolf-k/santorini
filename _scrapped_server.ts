import { Server, Socket } from "socket.io";

interface ServerToClientEvents {
  noArg: () => void;
  basicEmit: (a: number, b: string, c: Buffer) => void;
  withAck: (d: string, callback: (e: number) => void) => void;

  init: (data: string) => void;
}

interface ClientToServerEvents {
  hello: () => void;
}

interface InterServerEvents {
  ping: () => void;
}

interface SocketData {
  name: string;
  age: number;
}

///////////////////////////////////////////////

interface Room {
  roomId: string,
  players: Client[],
}

interface Client {
  socket: Socket,
  room: null | Room,
}

type ExtSocket = Socket & {  }

const io = new Server<
  ClientToServerEvents,
  ServerToClientEvents,
  InterServerEvents,
  SocketData
>({
    cors: {
        origin: "http://localhost:5173"
      }
});

var clients: Socket[] = [];

io.use((socket, next) => {
  const username = socket.handshake.auth.username;
  if (!username) {
    return next(new Error("Invalid username."));
  }
  socket.username = username;
  next();
})

io.on("connection", client => {
    console.log(client.id + " has connected.");
    clients.push(client);

    client.on("disconnect", () => {
      console.log(client.id + " has disconnected.");
      var i = clients.indexOf(client);
      clients.splice(i, 1);
    });
});

io.listen(3000);