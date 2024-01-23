import {
    Stat,
    StatLabel,
    StatNumber,
    StatHelpText,
    StatArrow,
  } from '@chakra-ui/react'

import { Card } from '@chakra-ui/react'

import { useState, useContext } from 'react'
import { ChainContext } from '../contexts/ChainProvider'

export const HomecoinBalance = (props) => {

    const { homecoinBalance } = useContext(ChainContext)

    return(
    <Card className="stat-card">
        <Stat>
            <StatLabel>Homecoin Balance</StatLabel>
            <StatNumber>ḧ{homecoinBalance.toFixed(2)}</StatNumber>
            <StatHelpText>
                <StatArrow type="increase"/>
                10% dod
            </StatHelpText>
        </Stat>
    </Card>
    )
}