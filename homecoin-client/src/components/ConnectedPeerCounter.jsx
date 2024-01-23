import {
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText
  } from '@chakra-ui/react'

import { Card } from '@chakra-ui/react'

import { useState, useContext } from 'react'
import { PeerContext } from '../contexts/PeerProvider'

export const ConnectedPeerCounter = (props) => {

    const { peerIds } = useContext(PeerContext)

    return(
    <Card className="stat-card">
        <Stat>
            <StatLabel>Connected Peers</StatLabel>
            <StatNumber>{peerIds.length}</StatNumber>
            <StatHelpText>Click to view</StatHelpText>
        </Stat>
    </Card>
    )
}