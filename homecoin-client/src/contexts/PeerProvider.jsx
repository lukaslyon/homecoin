// React-related imports
import { useState, createContext, useEffect, useContext } from "react";

// Third-party libraries
import { Peer } from 'peerjs'; 
import axios from "axios";

// Crypto utilities
import { digest, publicKeyToHex } from "../crypto/subtle";

// Chain and blockchain utilities
import { Chain, reconstructBlock, reconstructChain, serializeBlock, serializeUnminedBlock, reconstructUnminedBlock, serializeChain, serializeUnminedBlocks } from "../chain/blockchain";

// PeerJS utilities
import { requestTypes, HeartbeatManager } from "../utilities/peerjs";

// Custom hooks
import useIndexedDB from "../hooks/useIndexedDB";

// Context providers
import { KeyContext } from "./KeyProvider";
import { ChainContext } from "./ChainProvider";

export const PeerContext = createContext()

export const PeerProvider = (props) => {
    // States related to PeerJS and WebRTC connections
    const [peer, setPeer] = useState(null);
    const [id, setId] = useState(0);
    const [connected, setConnected] = useState(false);
    const [connections, setConnections] = useState([]);
    const [peerIds, setPeerIds] = useState([]);
    const [nodes, setNodes] = useState([]);
    const [peerChainHashes, setPeerChainHashes] = useState({});
    const [heartbeats, setHeartbeats] = useState([])

    // States for managing data with IndexedDB
    const [signalServer, setSignalServer] = useIndexedDB("signalServer", "homecoin", "");
    const [historicalPeers, setHistoricalPeers] = useIndexedDB("historicalPeers", "homecoin", []);
    const [nickname, setNickname] = useIndexedDB("nickname", "homecoin", "")

    // States for blockchain-related data and operations
    const { keyPair, publicHex, uuid } = useContext(KeyContext);
    const { 
        chain, 
        updateChain, 
        unminedBlocks, 
        updateUnminedBlocks, 
        setReceivedChains, 
        setLastBlockHash ,
        receivedUnminedBlock,
        setReceivedUnminedBlock,
        receivedMinedBlock,
        setReceivedMinedBlock,
        sendMinedBlock,
        setSendMinedBlock,
        sendUnminedBlock,
        setSendUnminedBlock,
    } = useContext(ChainContext);

    // Other state variables
    const [suppressSendUnminedBlocks, setSuppressSendUnminedBlocks] = useState(false);


    // handle messages from peers
    const dataHandler = (data, connection) => {
        switch (data.type){
            case requestTypes.REQUEST_BLOCKCHAIN_HASH:
                digest(chain).then((res) => {
                    connection.send({
                        "type": requestTypes.RESPONSE_BLOCKCHAIN_HASH,
                        "data": res
                    })
                }).catch((err) => {
                    console.log(err)
                })
                break;
            case requestTypes.RESPONSE_BLOCKCHAIN_HASH:
                setPeerChainHashes(({...peerChainHashes, [connection.peer]: data.data}))
                break;
            case requestTypes.IDENTIFIER:
                if (!historicalPeers.some(p => p.id === data.data.id)) {
                    setHistoricalPeers([...historicalPeers, {
                        "label": data.data.label,
                        "id": data.data.id,
                        "publicKey": data.data.publicKey
                    }])
                }
                break;
            case requestTypes.SEND_NEW_BLOCK:

                setReceivedUnminedBlock(reconstructUnminedBlock(data.data.block))

                break;
            
            case requestTypes.REQUEST_ALL_BLOCKS:
                sendAllUnminedBlocks(connection)
                break;

            case requestTypes.RESPONSE_ALL_BLOCKS:
                setSuppressSendUnminedBlocks(true)
                data.data.blocks.forEach((_received) => {
                    updateUnminedBlocks(currentBlocks => {
                        if (!currentBlocks.some(b => b.header.id === _received.header.id)) {
                            return [...currentBlocks, reconstructUnminedBlock(_received)];
                        } else {
                            return currentBlocks;
                        }
                    });
                })
                setSuppressSendUnminedBlocks(false)
                break;

            case requestTypes.REQUEST_FULL_CHAIN:
                sendFullBlockchain(connection)
                break;

            case requestTypes.RESPONSE_FULL_CHAIN:
                const _chain = reconstructChain(data.data.chain)
                if(_chain.chain.every(async (b) => {
                    const validBlock = await b.verify()
                    return validBlock
                })){
                    setReceivedChains((chains) => [...chains, _chain])
                }
                break;

            case requestTypes.SEND_MINED_BLOCK:
                setReceivedMinedBlock(reconstructBlock(data.data.block))

                break;

            case requestTypes.UPDATE_IDENTITY:
                if (!historicalPeers.some(p => p.id === data.data.id)) {
                    setHistoricalPeers([...historicalPeers, {
                        "label": data.data.label,
                        "id": data.data.id,
                        "publicKey": data.data.publicKey
                    }])
                } else{
                    setHistoricalPeers([...historicalPeers.filter((p) => p.id !== data.data.id), {
                        "label": data.data.label,
                        "id": data.data.id,
                        "publicKey": data.data.publicKey
                    }])
                }
        }
    }

    // const requestBlockchainHash = (connection) => {
    //     connection.send({
    //         "type": requestTypes.REQUEST_BLOCKCHAIN_HASH
    //     })
    // }
    
    const requestChainFromPeer = (connection) => {
        connection.send({
            "type": requestTypes.REQUEST_FULL_CHAIN
        })
    }
    
    const requestUnminedFromPeer = (connection) => {
        connection.send({
            "type": requestTypes.REQUEST_ALL_BLOCKS
        })
    }

    const sendGreeting = (connection) => {

        publicKeyToHex(keyPair.publicKey).then((hex) => {
            connection.send({
                "type": requestTypes.IDENTIFIER,
                "data": {
                    "label": (nickname === "") ? peer.id: nickname,
                    "id": peer.id,
                    "publicKey": hex
                }
            })
        })
    }

    const updateGreeting = (connection) => {
        publicKeyToHex(keyPair.publicKey).then((hex) => {
            connection.send({
                "type": requestTypes.UPDATE_IDENTITY,
                "data": {
                    "label": (nickname === "") ? peer.id: nickname,
                    "id": peer.id,
                    "publicKey": hex
                }
            })
        })
    }

    const sendNewBlock = (connection, block) => {
        connection.send({
            "type": requestTypes.SEND_NEW_BLOCK,
            "data": {
                "block": serializeUnminedBlock(block)
            }
        })
    }

    const sendAllUnminedBlocks = (connection) => {
        connection.send({
            "type": requestTypes.RESPONSE_ALL_BLOCKS,
            "data": {
                "blocks": serializeUnminedBlocks(unminedBlocks)
            }
        })
    }

    const sendFullBlockchain = (connection) => {

        updateChain((_chain) => {
            connection.send({
                "type": requestTypes.RESPONSE_FULL_CHAIN,
                "data": {
                    "chain": serializeChain(_chain)
                }
            })
            return _chain
        })
    }

    const handlePossibleMinedBlock = (block) => {
        block.verify()
        .then((valid) => {
            if (valid){
                block.verifyTransactions()
                .then((valid) => {
                    if (valid){
                        setLastBlockHash((_hash) =>{
                            updateChain((_chain) => {
                                if (block.header.prevHash === _hash){
                                    updateUnminedBlocks((unminedBlocks) => {
                                        return(unminedBlocks.filter((b) => {
                                            return(b.header.id !== block.header.id)
                                        }))
                                    })
                                    setSendMinedBlock(block)
                                    return(new Chain([..._chain.chain, block]))
                                }
                                else{
                                    console.log("Chain linkage failed")
                                    return _chain
                                }
                            })
                        return _hash                               
                     })
                    }
                    else console.log("Transaction verification failed")
                })
                .catch((err) => {
                    console.log(err)
                })
            }
            else console.log("Proof of work verification failed")
        })
    }

    const lookupKnownPeer = (publicKey) => {
        if (publicKey === publicHex) return "you"
        let match = historicalPeers.find(p => p.publicKey === publicKey)
        if (match !== undefined) return match.label
        return publicKey
    }

    useEffect(() => {
        const handleBeforeUnload = (e) => {
            peer.disconnect()
        };
      
        window.addEventListener('beforeunload', handleBeforeUnload);
      
        // Remove the event listener on cleanup.
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
        };
    }, [])
    
    useEffect(() => {
        // on render and on update to signalServer, create new peer object
        // todo: don't hardcode this
        if ((signalServer !== "")&&(uuid !== "")){
            const _id = uuid
            const _url = new URL(signalServer)
            setPeer((p) => new Peer(_id,{
                path: _url.pathname,
                port: _url.port,
                host: _url.hostname,
                key: "homecoin",
                config: {
                    iceServers: [
                        {url:import.meta.env.VITE_ICE_STUN_SERVER},
                        {url:import.meta.env.VITE_ICE_TURN_SERVER, username: import.meta.env.VITE_ICE_TURN_USER, credential: import.meta.env.VITE_ICE_TURN_CREDENTIAL},
                    ]
                }
            }))
        }
    },[signalServer, uuid])

    useEffect(() => {
        if (peer !== null) {
            peer.on("error", (error) => {
                // for now, log errors to console
                console.log(error)
            })
            peer.on("open", (id) => {
                // on successful connection to signal server, set id and get list of potential peers
                setConnected(() => true)
                setId(() => id)

                axios.get(signalServer + "/homecoin/peers").then((res) => {
                    setNodes(res.data)
                })
            })
            peer.on("disconnect", () => {
                setConnections((conn) => {
                    conn.close()
                })
            })
            peer.on("connection", (connection) => {
                connection.on("open", () => {
                    // on successful remote connection from peer, update local connections
                    setConnections((conn) => {
                        if (conn.every((c) => (c.peer !== connection.peer))){
                            return [...conn, connection]
                        }
                        else{
                            const _connections = conn.filter(c => c.peer !== connection.peer)
                            return [..._connections, connection]
                        }
                    })
                    setPeerIds((pids) => {
                        if (pids.every((p) => p !== connection.peer)){
                            return [...pids, connection.peer]
                        }
                        else{
                            const _peers = pids.filter(p => p !== connection.peer)
                            return [..._peers, connection.peer]
                        }
                        
                    })
                    setHeartbeats((hb) => [...hb, {hb: new HeartbeatManager(peer, connection), peer: connection.peer}])
                    //requestBlockchainHash(connection)
                    sendGreeting(connection)
                    requestChainFromPeer(connection)
                })
                connection.on("close", () => {
                    // update local connections on disconnect
                    console.log("Closing connection")
                    setConnections((_connections) => _connections.filter(c => c.peer !== connection.peer))
                    setPeerIds((_peerIds) => _peerIds.filter(pid => pid !== connection.peer))
                    setHeartbeats((hb) => hb.filter((b) => b.peer !== connection.peer))

                })
                connection.on("error", () => {
                    // update local connections on disconnect
                    console.log("Connection error")
                    setConnections((_connections) => _connections.filter(c => c.peer !== connection.peer))
                    setPeerIds(peerIds.filter(pid => pid !== connection.peer))

                })
                connection.on("data", (data) => {
                    dataHandler(data, connection)
                })
            })
        }
        return () => {

        }
    },[peer, historicalPeers])

    useEffect(() => {
        if (nodes !== null) {
            nodes.forEach((n) => {
                if (n !== id && !peerIds.includes(n)){
                    const connection = peer.connect(n, {
                        "label": n 
                    })
                    
                    // add connection to list before verifying
                    connection.on("close", () => {
                        console.log("Closing connection")
                        setConnections((_connections) => _connections.filter(c => c !== connection))
                        setPeerIds((_peerIds) => _peerIds.filter(pid => pid !== connection.peer))
                        setHeartbeats((hb) => hb.filter((h) => h.peer !== connection.peer))
                    })
                    connection.on("open", () => {
                        setConnections((conn) => {
                            if (conn.every((c) => (c.peer !== connection.peer))){
                                return [...conn, connection]
                            }
                            else{
                                const _connections = conn.filter(c => c.peer !== connection.peer)
                                return [..._connections, connection]
                            }
                        })
                        setPeerIds((pids) => {
                            if (pids.every((p) => p !== connection.peer)){
                                return [...pids, connection.peer]
                            }
                            else{
                                const _peers = pids.filter(p => p !== connection.peer)
                                return [..._peers, connection.peer]
                            }
                            
                        })
                        setHeartbeats((hb) => [...hb, {hb: new HeartbeatManager(peer, connection), peer: connection.peer}])
                        sendGreeting(connection)
                        requestChainFromPeer(connection)
                    })
                    connection.on("error", (err) => {
                        // on connection error, remove connection from list
                        // is there a better way to handle outgoing connections?
                        console.log("Connection error")
                        setConnections(conn.filter(c => c !== connection))
                        setPeerIds(peerIds.filter(pid => pid !== connection.peer))
                    })
                    connection.on("data", (data) => {
                        dataHandler(data, connection)
                    })
                }
            })
        }
    }, [nodes])

    // useEffect(() => {
    //     if ((unminedBlocks.length !== 0)&&(!suppressSendUnminedBlocks)){
    //         connections.forEach((conn) => {
    //             sendNewBlock(conn, unminedBlocks[unminedBlocks.length - 1])
    //         })
    //     }
    // }, [unminedBlocks])

    useEffect(() => {
        if (receivedUnminedBlock !== null){
            setSuppressSendUnminedBlocks(true)
            updateUnminedBlocks((currentBlocks) => {
                if (!unminedBlocks.some(b => b.header.id === receivedUnminedBlock.header.id)) {
                    return [...currentBlocks, receivedUnminedBlock];
                } else {
                    return currentBlocks;
                }
            });
            return(() => {
                setSuppressSendUnminedBlocks(false)
                setReceivedUnminedBlock(null)
            })
        }
    }, [receivedUnminedBlock, suppressSendUnminedBlocks, unminedBlocks])

    useEffect(() => {
        if (receivedMinedBlock !== null){
            handlePossibleMinedBlock(receivedMinedBlock)
        }

        return(() => {
            setReceivedMinedBlock(null)
        })
    }, [receivedMinedBlock])

    useEffect(() => {
        if (sendMinedBlock !== null){
            connections.forEach((conn) => {
                conn.send({
                    "type": requestTypes.SEND_MINED_BLOCK,
                    "data": {
                        "block": serializeBlock(sendMinedBlock)
                    }
                })
            })
        }
        return(() => {
            setSendMinedBlock(null)
        })
    }, [connections, sendMinedBlock])

    useEffect(() => {
        if (sendUnminedBlock !== null){
            connections.forEach((conn) => {
                sendNewBlock(conn, sendUnminedBlock)
            })
        }
        return(() => {
            setSendUnminedBlock(null)
        })
    }, [sendUnminedBlock, connections])

    useEffect(() => {
        if (nickname !== ""){
            connections.forEach((c) => {
                updateGreeting(c)
            })
        }
    }, [nickname])

    return (
        <PeerContext.Provider value={{peer: peer, 
                                    id, 
                                    connected,
                                    connections, 
                                    peerIds, 
                                    nodes, 
                                    signalServer, 
                                    setSignalServer,
                                    setPeerChainHashes,
                                    historicalPeers,
                                    lookupKnownPeer,
                                    requestChainFromPeer,
                                    requestUnminedFromPeer,
                                    nickname,
                                    setNickname
                                    }}>
            {props.children}
        </PeerContext.Provider>
    )

}