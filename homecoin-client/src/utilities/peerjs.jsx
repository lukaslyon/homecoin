import axios from 'axios'

export const connect_to_peer_by_id = (me, peerIds, peer) => {
    if (!peerIds.includes(peer)){
        const connection = me.connect(peer)
        return connection
    }
    else return null
}

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