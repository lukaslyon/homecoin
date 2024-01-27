import { useState, useEffect, useContext } from 'react'
import { ConnectedPeerCounter } from '../components/ConnectedPeerCounter'

import { useDisclosure, Heading } from '@chakra-ui/react'

import { Header } from '../components/Header'
import { ChainBrowser } from '../components/ChainBrowser'

import "../../styles/Page.css"
import { RequestModal } from '../components/RequestModal'
import { TransactionBrowser } from '../components/TransactionBrowser'

export const Dashboard = (props) => {

    const { isOpen, onOpen, onClose } = useDisclosure()

    return(
        <div className = "dashboard">
            <Header onModalOpen={onOpen}/>
            <Heading size="sm">Current Blockchain</Heading>
            <ChainBrowser />
            <Heading size="sm">Pending Blocks</Heading>
            <TransactionBrowser />
            <RequestModal isOpen={isOpen} onOpen={onOpen} onClose={onClose}/>
        </div>

    )
}