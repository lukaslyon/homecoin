import { Text } from "@chakra-ui/react"

import "../../styles/Block.css"
import { useContext } from "react"
import { PeerContext } from "../contexts/PeerProvider"

export const Transaction = (props) => {
    
    const { lookupKnownPeer } = useContext(PeerContext)

    return(
        <div className="tx-contents">
            <Text fontSize={15} noOfLines={1}>
                From: {lookupKnownPeer(props.tx.contents.from)}
            </Text>
            <Text fontSize={15} noOfLines={1}>
                To: {lookupKnownPeer(props.tx.contents.to)}
            </Text>
            <Text fontSize={15}noOfLines={1}>
                Amount: {props.tx.contents.amount}
            </Text>
        </div>

    )
}