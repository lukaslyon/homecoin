import {
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText
  } from '@chakra-ui/react'

import { Card } from '@chakra-ui/react'

import { useState, useContext } from 'react'
import { ChainContext } from '../contexts/ChainProvider'

export const PendingTransactions = (props) => {

    const { pendingTransactions } = useContext(ChainContext)

    return(
    <Card className="stat-card">
        <Stat>
            <StatLabel>Pending Blocks</StatLabel>
            <StatNumber>{pendingTransactions}</StatNumber>
        </Stat>
    </Card>
    )
}