import { createContext, useState, useEffect, useContext } from "react";
import { Chain, genesisNode, UnminedBlock, Transaction, version, bits } from '../chain/blockchain.jsx';
import useIndexedDB from "../hooks/useIndexedDB.jsx";
import { KeyContext } from "./KeyProvider.jsx";
import { digest } from "../crypto/subtle.jsx";
export const ChainContext = createContext()

export const ChainProvider = (props) => {

    const [homecoinBalance, setHomecoinBalance] = useState(0)
    const [unminedBalance, setUnminedBalance] = useState(0)
    const [transactionsToMe, setTransactionsToMe] = useState(0)
    const [pendingTransactions, setPendingTransactions] = useState(0)
    const [lastBlockHash, setLastBlockHash] = useState(0)

    const [chain, updateChain, chainLoaded] = useIndexedDB("chain", "homecoin", new Chain())
    const [unminedBlocks, updateUnminedBlocks, unminedBlocksLoaded] = useIndexedDB("unmined", "homecoin", [])
    const [receivedChains, setReceivedChains] = useState([])

    const [receivedUnminedBlock, setReceivedUnminedBlock] = useState(null)
    const [receivedMinedBlock, setReceivedMinedBlock] = useState(null)

    const [sendMinedBlock, setSendMinedBlock] = useState(null)
    const [sendUnminedBlock, setSendUnminedBlock] = useState(null)

    const { publicHex, keyPair, keyPairLoaded } = useContext(KeyContext)

    const mineBlock = async (block) => {
        block.addRewardTransaction(publicHex)
        const mineResult = await block.mine()
        updateUnminedBlocks((unminedBlocks) => {
            return(unminedBlocks.filter((b) => {
                return(b.header.id !== block.header.id)
            }))
        })
        updateChain((chain) => {
            return(new Chain([...chain.chain, block]))
        })
        setSendMinedBlock(block)
        return mineResult;
    }

    useEffect(() => {

        if ((chain.chain.length === 0)&&chainLoaded&&(publicHex!=="")){
            const _chain = new Chain()
            _chain.assignGenesisBlock(publicHex).then(() =>{
                updateChain(_chain)
            })
        }

        if (chain.chain.length !== 0) {

            digest(chain.chain[chain.chain.length-1].header).then((hash) => {
                setLastBlockHash(hash)
            })
        }

    }, [chain, chainLoaded, publicHex, keyPair])

    useEffect(() => {
        let val = 0
        if ((unminedBlocks.length !==0)&&unminedBlocksLoaded){
            unminedBlocks.forEach((b) => {
                b.tx.forEach((t) => {
                    if (t.contents.from === publicHex){
                        val -= Number(t.contents.amount)
                    }
                    if (t.contents.from === publicHex){
                        setTransactionsToMe((tx) => tx+1)
                    }
                })
            })
        }

        if ((chain.chain.length !==0)&&chainLoaded){
            chain.chain.forEach((b) => {
                b.tx.forEach((t) => {
                    if (t.contents.to === publicHex){
                        setTransactionsToMe((tx) => tx+1)
                        val += Number(t.contents.amount)
                    }
                    else if (t.contents.from === publicHex){
                        val -= Number(t.contents.amount)
                    }
                })
            })
        }

        setHomecoinBalance(val)

    },[chain, chainLoaded, unminedBlocks, unminedBlocksLoaded, publicHex])

    useEffect(() => {
        let val = 0
        if ((unminedBlocks.length !==0)&&unminedBlocksLoaded){
            unminedBlocks.forEach((b) => {
                b.tx.forEach((t) => {
                    if (t.contents.from === publicHex){
                        val -= Number(t.contents.amount)
                    }
                    if (t.contents.to === publicHex){
                        val += Number(t.contents.amount)
                    }
                })
            })
        }
        setUnminedBalance(val)
    }, [unminedBlocks, unminedBlocksLoaded, publicHex])

    useEffect(() => {
        if (receivedChains.length !== 0){
            let _length = chain.chain.length;
            let _chain = chain;
            receivedChains.forEach((c) => {
                if ((c.chain.length === 1)&&(chain.chain.length === 1)&&(c.chain[0].header.creationTimestamp < chain.chain[0].header.creationTimestamp)){
                    console.log("found earlier genesis block")
                    _chain = c
                }
            })
            receivedChains.forEach((c) => {
                if (c.chain.length > _length){
                    _chain = c
                    _length = c.chain.length
                }
            })
            if (_chain !== chain){
                updateChain(_chain)
            }
        }
    },[receivedChains, chain])

    useEffect(() => {
        setPendingTransactions(unminedBlocks.length)
    }, [unminedBlocks])

    return(
        <ChainContext.Provider value={{homecoinBalance, pendingTransactions, chain, updateChain, unminedBlocks, updateUnminedBlocks, receivedChains, setReceivedChains, mineBlock, lastBlockHash, setLastBlockHash, receivedMinedBlock, setReceivedMinedBlock, receivedUnminedBlock, setReceivedUnminedBlock, sendMinedBlock, setSendMinedBlock, sendUnminedBlock, setSendUnminedBlock}}>
            {props.children}
        </ChainContext.Provider>
    )
}