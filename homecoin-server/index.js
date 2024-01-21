const { PeerServer } = require('peer')
const peerServer = PeerServer({port: 9000, path: "/signal", key: "homecoin", allow_discovery: true})