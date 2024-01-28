import { useContext, useState } from "react";
import { Card, CardHeader, CardBody, CardFooter, Button, useToast, Spinner, Badge, Box } from '@chakra-ui/react'
import {
    Accordion,
    AccordionItem,
    AccordionButton,
    AccordionPanel,
    AccordionIcon,
  } from '@chakra-ui/react'
import { Heading, Text } from "@chakra-ui/react";
import { ChainContext } from "../contexts/ChainProvider";
import { Transaction } from "./Transaction";
import { formatDateTime } from "../utilities/time";

import "../../styles/Block.css"
import { PeerContext } from "../contexts/PeerProvider";

import { Block } from "../chain/blockchain";

export const BlockCard = (props) => {

    const { mineBlock, lastBlockHash } = useContext(ChainContext)
    const { socializeBlock, lookupKnownPeer } = useContext(PeerContext)
    const [mining, setMining] = useState(false)
    const mineToast = useToast()

    const onClickMine = async () => {
        setMining(true)
        const hash = lastBlockHash
        const readyBlock = new Block(props.block, hash)
        mineBlock(readyBlock).then((res) => {
            if (res === "success"){
                mineToast({
                    title: 'Block mined',
                    description: `The block ${props.block.header.merkleRoot} has been successfully mined.`,
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                })
                socializeBlock(readyBlock)
                setMining(false)
            }
        })
    }

    return(
        <Card className = "block-card">
            <CardHeader className="block-card-header">
                <Heading size="xs">
                    Created at: { formatDateTime(props.block.header.creationTimestamp) }
                </Heading>
            </CardHeader>
            <CardBody className="block-card-contents">
                <Accordion allowToggle={true}>
                {props.block.tx.map((t) => {
                    return(<AccordionItem key={t.contents.timestamp}>
                        <AccordionButton>
                            <Box as="span" flex='1' textAlign='left'>
                                {t.contents.label}
                            </Box>
                            <AccordionIcon />
                        </AccordionButton>
                        <AccordionPanel>
                            <Transaction tx={t}/>
                        </AccordionPanel>
                    </AccordionItem>)
                })}
                </Accordion>
            </CardBody>
            <CardFooter className="block-card-footer">
                {(props.unmined) ? (!mining) ? <Button onClick = {onClickMine}>Mine</Button> : <Spinner /> : <Badge colorScheme="green">Mined</Badge>}
            </CardFooter>
        </Card>
    )
}