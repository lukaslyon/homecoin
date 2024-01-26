import { useContext } from "react";
import { Card, CardHeader, CardBody, CardFooter, Button } from '@chakra-ui/react'
import { Heading, Text } from "@chakra-ui/react";
import { ChainContext } from "../contexts/ChainProvider";
import { Transaction } from "./Transaction";
import { formatDateTime } from "../utilities/time";

import "../../styles/Block.css"
import { PeerContext } from "../contexts/PeerProvider";

export const Block = (props) => {

    const { mineBlock } = useContext(ChainContext)
    const { socializeBlock, lookupKnownPeer } = useContext(PeerContext)

    const onClickMine = async () => {
        await mineBlock(props.block)
        socializeBlock(props.block)
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
            <CardFooter>
                {(props.block.metadata.mineTime===null) ? <Button onClick = {onClickMine}>Mine</Button> : null}
            </CardFooter>
        </Card>
    )
}