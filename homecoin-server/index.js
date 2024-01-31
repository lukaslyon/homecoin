const { PeerServer } = require('peer')
const fs = require('fs')
const peerServer = PeerServer({port: 9000,
    path: "/signal",
    key: "homecoin",
    allow_discovery: true,
    ssl: {
		key: fs.readFileSync("../local-keys/privatekey.pem"),
		cert: fs.readFileSync("../local-keys/server.homecoin.org.crt"),
    ca: fs.readFileSync("../local-keys/server.homecoin.org.ca.crt")
	}
    })

