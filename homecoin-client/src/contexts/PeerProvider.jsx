import { useState, createContext, useEffect, useContext } from "react";
import { Peer } from 'peerjs'; 
import axios from "axios";
import { useCookie } from "../hooks/useCookie";
import { digest, publicKeyToHex } from "../crypto/subtle";
import { frameData } from "framer-motion";

import { Chain } from "../chain/blockchain";
import { requestTypes } from "../utilities/peerjs";
import { mostFrequentHashOwner } from "../utilities/peerjs";
import useIndexedDB from "../hooks/useIndexedDB";
import { KeyContext } from "./KeyProvider";
import { ChainContext } from "./ChainProvider";
import { reconstructBlock, reconstructChain, serializeBlock, serializeChain, serializeUnminedBlocks } from "../chain/blockchain";

export const PeerContext = createContext()

export const PeerProvider = (props) => {
    const [peer, setPeer] = useState(null)
    const [id, setId] = useState(0)
    const [connected, setConnected] = useState(false)
    const [connections, setConnections] = useState([])
    const [peerIds, setPeerIds] = useState([])
    const [nodes, setNodes] = useState([])
    const [signalServer, setSignalServer] = useState("")
    const [peerChainHashes, setPeerChainHashes] = useState({})

    const [historicalPeers, setHistoricalPeers] = useIndexedDB("historicalPeers", "homecoin", [])
    const {keyPair, publicHex} = useContext(KeyContext)
    const { chain, updateChain, unminedBlocks, updateUnminedBlocks, setReceivedChains, lastBlockHash, setLastBlockHash } = useContext(ChainContext)

    const [suppressSendUnminedBlocks, setSuppressSendUnminedBlocks] = useState(false)

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
                updateUnminedBlocks(currentBlocks => {
                    if (!currentBlocks.some(b => b.header.id === data.data.block.header.id)) {
                        return [...currentBlocks, reconstructBlock(data.data.block)];
                    } else {
                        return currentBlocks;
                    }
                });
                break;
            
            case requestTypes.REQUEST_ALL_BLOCKS:
                sendAllUnminedBlocks(connection)
                break;

            case requestTypes.RESPONSE_ALL_BLOCKS:
                setSuppressSendUnminedBlocks(true)
                data.data.blocks.forEach((b) => {
                    updateUnminedBlocks(currentBlocks => {
                        if (!currentBlocks.some(b => b.header.id === data.data.block.header.id)) {
                            return [...currentBlocks, reconstructBlock(data.data.block)];
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
                handlePossibleMinedBlock(reconstructBlock(data.data.block))
        }
    }

    const requestBlockchainHash = (connection) => {
        connection.send({
            "type": requestTypes.REQUEST_BLOCKCHAIN_HASH
        })
    }
    
    const requestChainFromPeer = (connection) => {
        connection.send({
            "type": requestTypes.REQUEST_FULL_CHAIN
        })
    }

    const sendGreeting = (connection) => {

        publicKeyToHex(keyPair.publicKey).then((hex) => {
            connection.send({
                "type": requestTypes.IDENTIFIER,
                "data": {
                    "label": peer.id, // todo: allow user to select nickname
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
                "block": serializeBlock(block)
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
                                    socializeBlock(block)
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

    const socializeBlock= (block) => {
        connections.forEach((conn) => {
            conn.send({
                "type": requestTypes.SEND_MINED_BLOCK,
                "data": {
                    "block": serializeBlock(block)
                }
            })
        })
    }

    const lookupKnownPeer = (publicKey) => {
        if (publicKey === publicHex) return "you"
        let match = historicalPeers.find(p => p.publicKey === publicKey)
        if (match !== undefined) return match.label
        return publicKey
    }
    
    useEffect(() => {
        // on render and on update to signalServer, create new peer object
        // todo: don't hardcode this
        if (signalServer !== ""){
            const _id = `${publicHex.substring(0, 8)}-${publicHex.substring(12, 16)}-${publicHex.substring(56, 60)}-${publicHex.substring(60, 64)}-${publicHex.substring(64, 76)}`;
            setPeer((p) => new Peer(_id,{
                path: "/signal",
                port: 9000,
                host: "ec2-16-170-232-139.eu-north-1.compute.amazonaws.com",
                key: "homecoin"
            }))
        }
    },[signalServer, publicHex])

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
            peer.on("connection", (connection) => {
                connection.on("open", () => {
                    // on successful remote connection from peer, update local connections
                    setConnections((conn) => [...conn, connection])
                    setPeerIds((pids) => [...pids, connection.peer])
                    //requestBlockchainHash(connection)
                    sendGreeting(connection)
                    requestChainFromPeer(connection)
                })
                connection.on("close", (conn) => {
                    // update local connections on disconnect
                    setConnections(conn.filter(c => c !== connection))
                    setPeerIds(peerIds.filter(pid => pid !== connection.peer))

                })
                connection.on("data", (data) => {
                    dataHandler(data, connection)
                })
            })
        }
    },[peer, historicalPeers])

    useEffect(() => {
        // this needs work, intent was to loop over potential peers and attempt a connection
        if (nodes !== null) {
            nodes.forEach((n) => {
                if (n !== id && !peerIds.includes(n)){
                    const connection = peer.connect(n, {
                        "label": n 
                    })
                    
                    // add connection to list before verifying
                    setConnections((conn) => [...conn, connection])
                    setPeerIds((pids) => [...pids, connection.peer])
                    connection.on("close", (conn) => {
                        // update local connections on disconnect
                        setConnections(conn.filter(c => c !== connection))
                        setPeerIds(peerIds.filter(pid => pid !== connection.peer))
                    })
                    connection.on("open", () => {
                        //requestBlockchainHash(connection)
                        sendGreeting(connection)
                        requestChainFromPeer(connection)
                    })
                    connection.on("error", (err) => {
                        // on connection error, remove connection from list
                        // is there a better way to handle outgoing connections?
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

    useEffect(() => {
        if ((unminedBlocks.length !== 0)&&(!suppressSendUnminedBlocks)){
            connections.forEach((conn) => {
                sendNewBlock(conn, unminedBlocks[unminedBlocks.length - 1])
            })
        }
    }, [unminedBlocks])

    // useEffect(() => {
    //     if (chain.chain.length !== 0){
    //         socializeBlock(chain.chain[-1])
    //     }
    // }, [chain])

    return (
        <PeerContext.Provider value={{peer: peer, 
                                    id: id, 
                                    connected: connected,
                                    connections: connections, 
                                    peerIds: peerIds, 
                                    nodes: nodes, 
                                    signalServer: signalServer, 
                                    setSignalServer: setSignalServer,
                                    peerChainHashes: setPeerChainHashes,
                                    historicalPeers: historicalPeers,
                                    socializeBlock,
                                    lookupKnownPeer
                                    }}>
            {props.children}
        </PeerContext.Provider>
    )

}