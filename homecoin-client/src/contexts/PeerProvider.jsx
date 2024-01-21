import { useState, createContext, useEffect } from "react";
import { Peer } from 'peerjs'; 
import axios from "axios";
import { connect_to_peer_by_id } from "../utilities/peerjs";

export const PeerContext = createContext()

export const PeerProvider = (props) => {
    const [peer, setPeer] = useState(null)
    const [id, setId] = useState(0)
    const [connected, setConnected] = useState(false)
    const [connections, setConnections] = useState([])
    const [peerIds, setPeerIds] = useState([])
    const [nodes, setNodes] = useState([])
    const [signalServer, setSignalServer] = useState("")

    useEffect(() => {
        if (signalServer !== ""){
            setPeer((p) => new Peer({
                path: "/signal",
                port: 9000,
                host: "localhost",
                key: "homecoin"
            }))
        }
    },[signalServer])

    useEffect(() => {
        if (peer !== null) {
            peer.on("error", (error) => {
                console.log(error)
            })
            peer.on("open", (id) => {
                setConnected(() => true)
                setId(() => id)

                axios.get(signalServer + "homecoin/peers").then((res) => {
                    setNodes(res.data)
                })
            })
            peer.on("connection", (connection) => {
                console.log(connection)
                connection.on("close", (conn) => {
                    setConnections(conn.filter(c => c !== connection))
                    setPeerIds(peerIds.filter(pid => pid !== connection.peer))

                })
                setConnections((conn) => [...conn, connection])
                setPeerIds((pids) => [...pids, connection.peer])
            })
        }
    },[peer])

    useEffect(() => {
        if (nodes !== null) {
            nodes.forEach((n) => {
                if (n !== id){
                    const connection = connect_to_peer_by_id(peer, peerIds, n)
                    if (connections !== null) {
                        setConnections((conn) => [...conn, connection])
                        setPeerIds((pids) => [...peerIds, connection.peer])
                    }
                }   
            })
        }
    }, [nodes])


    return (
        <PeerContext.Provider value={{peer: peer, 
                                    id: id, 
                                    connected: connected,
                                    connections: connections, 
                                    peerIds: peerIds, 
                                    nodes: nodes, 
                                    signalServer: signalServer, 
                                    setSignalServer: setSignalServer}}>
            {props.children}
        </PeerContext.Provider>
    )

}