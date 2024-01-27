import { useContext, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Button, useToast, Spinner, Badge } from '@chakra-ui/react'
import { Heading, Text } from "@chakra-ui/react";
import { ChainContext } from "../contexts/ChainProvider";
import { Transaction } from "./Transaction";
import { formatDateTime } from "../utilities/time";

import "../../styles/Block.css"
import { PeerContext } from "../contexts/PeerProvider";

export const Block = (props) => {

    const { mineBlock } = useContext(ChainContext)
    const { socializeBlock, lookupKnownPeer } = useContext(PeerContext)
    const [mining, setMining] = useState(false)
    const mineToast = useToast()

    const onClickMine = async () => {
        setMining(true)
        mineBlock(props.block).then((res) => {
            console.log(res)
            if (res === "success"){
                mineToast({
                    title: 'Block mined',
                    description: `The block ${props.block.header.merkleRoot} has been successfully mined.`,
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                })
                socializeBlock(props.block)
                setMining(false)
            }
        })
    }

    return(
        <Card className = "block-card">
            <CardHeader className="block-card-header">
                <Heading size="xs">
                    Created at: { formatDateTime(props.block.header.timestamp) }
                </Heading>
            </CardHeader>
            <CardBody className="block-card-contents">
                <Transaction tx={props.block.tx} />
            </CardBody>
            <CardFooter className="block-card-footer">
                {(props.block.metadata.mineTime===null) ? (!mining) ? <Button onClick = {onClickMine}>Mine</Button> : <Spinner /> : <Badge colorScheme="green">Mined</Badge>}
            </CardFooter>
        </Card>
    )
}