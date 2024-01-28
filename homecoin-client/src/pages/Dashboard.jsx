import { useState, useEffect, useContext } from 'react'
import { ConnectedPeerCounter } from '../components/ConnectedPeerCounter'

import { useDisclosure, Heading, IconButton, Spacer } from '@chakra-ui/react'

import { Header } from '../components/Header'
import { ChainBrowser } from '../components/ChainBrowser'

import "../../styles/Page.css"
import { RequestModal } from '../components/RequestModal'
import { TransactionBrowser } from '../components/TransactionBrowser'
import { RepeatIcon } from '@chakra-ui/icons'

import { PeerContext } from '../contexts/PeerProvider'

export const Dashboard = (props) => {

    const { isOpen, onOpen, onClose } = useDisclosure()
    const { connections, requestChainFromPeer, requestUnminedFromPeer } = useContext(PeerContext)

    const handleRefreshChain = () => {
        connections.forEach((c) => {
            requestChainFromPeer(c)
        })
    }

    const handleRefreshUnmined = () => {
        connections.forEach((c) => {
            requestUnminedFromPeer(c)
        })
    }

    return(
        <div className = "dashboard">
            <Header onModalOpen={onOpen}/>
            <Heading size="sm">
                Current Blockchain
                {"  "}
                <IconButton size="sm" icon={<RepeatIcon />} onClick={handleRefreshChain}/>
                </Heading>
            <ChainBrowser />
            <Heading size="sm">
                Pending Blocks
                {"  "}
                <IconButton size="sm" icon={<RepeatIcon />} onClick={handleRefreshUnmined}/>
            </Heading>
            <TransactionBrowser />
            <RequestModal isOpen={isOpen} onOpen={onOpen} onClose={onClose}/>
        </div>

    )
}