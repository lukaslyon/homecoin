import { Card } from '@chakra-ui/react'
import { Button } from '@chakra-ui/react'

import { useState, useContext } from 'react'

export const NewTransactionCard = (props) => {

    return(
    <Card className="create-tx-card">
        <div className="card-header">
            New Transaction
        </div>
        <Button colorScheme="blue" onClick={props.onModalOpen}>
            Create
        </Button>
    </Card>
    )
}