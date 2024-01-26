import { Input } from "@chakra-ui/react";
import { Button } from "@chakra-ui/react";
import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
  } from '@chakra-ui/react'
import { useToast } from '@chakra-ui/react'
import { useContext, useState } from "react";
import { PeerContext } from "../contexts/PeerProvider";
import { checkSignalServer } from "../utilities/peerjs";

import { useDisclosure } from "@chakra-ui/react";
import { ChainContext } from "../contexts/ChainProvider";
import { KeyContext } from "../contexts/KeyProvider";

export const SignalServerSelector = (props) => {

    const { signalServer, setSignalServer} = useContext(PeerContext)
    const [userSelectedServer, setUserSelectedServer] = useState("http://ec2-16-170-232-139.eu-north-1.compute.amazonaws.com:9000/signal/")
    const [signalServerError, setSignalServerError] = useState(false)
    const { isOpen, onOpen, onClose } = useDisclosure()
    const serverToast = useToast()

    const {chain} = useContext(ChainContext)
    const {keyPair} = useContext(KeyContext)

    const handleChangeUserSelectedServer = (event) => {
        setUserSelectedServer(event.target.value)
    }

    const handleSubmit = (event) => {
        checkSignalServer(userSelectedServer).then((res) => {
            setSignalServer(userSelectedServer)
        }).catch((err) => {
            setSignalServerError(true)
            serverToast(
                {
                    title: 'Invalid Signal Server',
                    description: "The server you provided is either unavailable or not a suitable homecoin signal server",
                    status: 'error',
                    duration: 9000,
                    isClosable: true,
                }
            )
        })
    }

    return(
        <>
        <Modal isOpen = {true} onClose = {onClose}>
            <ModalOverlay>
                <ModalContent>
                    <ModalHeader>Select Signal Server</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        Provide the fully-qualified location of the homecoin signal server you wish to use. The signal server is used to broker peer-to-peer connections.
                        <Input value={userSelectedServer} onChange={handleChangeUserSelectedServer}/>
                        <Button onClick={handleSubmit}>Submit</Button>
                    </ModalBody>
                </ModalContent>
            </ModalOverlay>
        </Modal>
        </>
    )
}