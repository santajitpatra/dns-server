const dgram = require("node:dgram");
const dnsPacket = require("dns-packet");
const server = dgram.createSocket("udp4");

const PORT = 53;

const db = {
  1: {
    name: "example.com",
    type: "A",
    data: "192.168.1.1",
  },
  2: {
    name: "example.com",
    type: "AAAA",
    data: "2001",
  },
  "vercel.com": "8.7.7.7",
  "google.com": "8.8.8.8",
};

server.on("message", (msg, rinfo) => {
  const packet = dnsPacket.decode(msg);
  const ipfromdb = db[packet.questions[0].name];

  const response = dnsPacket.encode({
    type: "response",
    id: packet.id,
    flags: dnsPacket.AUTHORITATIVE_ANSWER,
    questions: packet.questions,
    answers: [
      {
        type: "A",
        class: "IN",
        name: packet.questions[0].name,
        data: ipfromdb,
      },
    ],
  });
  server.send(response, rinfo.port, rinfo.address);
});

server.bind(PORT, () => console.log("DNS server listening on port 53"));
