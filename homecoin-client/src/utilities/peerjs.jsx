import axios from 'axios'

// export const connect_to_peer_by_id = (me, peerIds, peer) => {
//     if (!peerIds.includes(peer)){
//         const connection = me.connect(peer)
//         connection.on("error", (err) => {
//             console.log(err)
//         })
//         connection.on("data", (data) => {
//             // todo
//         })
//         return connection
//     }
//     else return null
// }

export const checkSignalServer = (url) => {
    const signalServerResult = new Promise((resolve, reject) => {
        axios.get(url).then((res) => {
            console.log(res.data)
            if (JSON.stringify(res.data) === JSON.stringify({"name":"PeerJS Server","description":"A server side element to broker connections between PeerJS clients.","website":"https://peerjs.com/"})) resolve(true)
            else reject(false)
        }).catch((err) => {
            reject(false)
        })
    })
    return signalServerResult
}

export const requestTypes = {
    "IDENTIFIER": "IDENTIFIER",
    "REQUEST_BLOCKCHAIN_HASH": "REQUEST_BLOCKCHAIN_HASH",
    "RESPONSE_BLOCKCHAIN_HASH": "RESPONSE_BLOCKCHAIN_HASH",
    "SEND_NEW_BLOCK": "SEND_NEW_BLOCK",
    "REQUEST_ALL_BLOCKS": "REQUEST_ALL_BLOCKS",
    "RESPONSE_ALL_BLOCKS": "RESPONSE_ALL_BLOCKS",
    "REQUEST_FULL_CHAIN": "REQUEST_FULL_CHAIN",
    "RESPONSE_FULL_CHAIN": "RESPONSE_FULL_CHAIN",
    "SEND_MINED_BLOCK": "SEND_MINED_BLOCK"
}

export const mostFrequentHashOwner = (obj) => {
    const getMode = (a, result) => {
        result = result || {};
        
        if (a.length === 0){
          return result;
        }
        
        var head = a.shift();
        if (result[head]){
          result[head]++;
        }
        else{
          result[head] = 1;
        }
        return getMode(a, result);
      }

    const mode = getMode(Object.values(obj))
    const index = Object.values(obj).indexOf(mode)
    return Object.keys(obj)[index]
}