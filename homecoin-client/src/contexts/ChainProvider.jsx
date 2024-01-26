import { createContext, useState, useEffect, useContext } from "react";
import { PeerContext } from "./PeerProvider";
import { Chain } from '../chain/blockchain.jsx';
import { db } from "../chain/db.jsx";
import { useLiveQuery } from "dexie-react-hooks";
import useIndexedDB from "../hooks/useIndexedDB.jsx";
import { KeyContext } from "./KeyProvider.jsx";
import { digest } from "../crypto/subtle.jsx";
export const ChainContext = createContext()

export const ChainProvider = (props) => {

    const [homecoinBalance, setHomecoinBalance] = useState(0)
    const [pendingTransactions, setPendingTransactions] = useState(0)
    const [lastBlockHash, setLastBlockHash] = useState(0)

    const [chain, updateChain, chainLoaded] = useIndexedDB("chain", "homecoin", new Chain())
    const [unminedBlocks, updateUnminedBlocks, unminedBlocksLoaded] = useIndexedDB("unmined", "homecoin", [])
    const [receivedChains, setReceivedChains] = useState([])

    const { publicHex } = useContext(KeyContext)

    const mineBlock = async (block) => {
        await block.mine()
        updateUnminedBlocks((unminedBlocks) => {
            return(unminedBlocks.filter((b) => {
                return(b.header.merkleRoot !== block.header.merkleRoot)
            }))
        })
        updateChain((chain) => {
            return(new Chain([...chain.chain, block]))
        })
    }

    useEffect(() => {

        if ((chain.chain.length === 0)&&chainLoaded){
            const _chain = new Chain()
            _chain.assignGenesisBlock().then(() =>{
                updateChain(_chain)
            })
        }

        if (chain.chain.length !== 0) {
            let val = 0
            chain.chain.forEach((b) => {
                if (b.tx.contents.to === publicHex){
                    val += Number(b.tx.contents.amount)
                }
                else if (b.tx.contents.from === publicHex){
                    val -= Number(b.tx.contents.amount)
                }
            })
            setHomecoinBalance(val)

            digest(chain.chain[chain.chain.length-1].header).then((hash) => {
                setLastBlockHash(hash)
            })
        }

    }, [chain, chainLoaded])

    return(
        <ChainContext.Provider value={{homecoinBalance: homecoinBalance, pendingTransactions: pendingTransactions, chain: chain, updateChain: updateChain, unminedBlocks: unminedBlocks, updateUnminedBlocks: updateUnminedBlocks, receivedChains, setReceivedChains, mineBlock, lastBlockHash, setLastBlockHash}}>
            {props.children}
        </ChainContext.Provider>
    )
}