import { FormControl, FormLabel, Input } from "@chakra-ui/react";
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
import { useContext, useState, useEffect } from "react";
import { PeerContext } from "../contexts/PeerProvider";
import { checkSignalServer } from "../utilities/peerjs";

import { useDisclosure } from "@chakra-ui/react";
import { ChainContext } from "../contexts/ChainProvider";
import { KeyContext } from "../contexts/KeyProvider";

export const SignalServerSelector = (props) => {

    const { signalServer, setSignalServer, nickname, setNickname} = useContext(PeerContext)
    const [userSelectedServer, setUserSelectedServer] = useState(signalServer)
    const [selectedNickname, setSelectedNickname] = useState(nickname)
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
            setNickname(selectedNickname)
            serverToast(
                {
                    title: 'Success',
                    description: "Successfully logged in",
                    status: 'success',
                    duration: 9000,
                    isClosable: true,
                }
            )
        }).catch((err) => {
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

    useEffect(() => {
        if (signalServer !== ""){
            setUserSelectedServer(signalServer)
        }
    }, [signalServer])

    useEffect(() => {
        if (nickname !== ""){
            setSelectedNickname(nickname)
        }
    }, [nickname])

    return(
        <>
        <Modal isOpen = {true} onClose = {onClose}>
            <ModalOverlay>
                <ModalContent>
                    <ModalHeader>Configure Homecoin</ModalHeader>
                    <ModalCloseButton />
                    <ModalBody>
                        <FormControl>
                            <FormLabel>
                                Signal Server Address
                            </FormLabel>
                            <Input value={userSelectedServer} onChange={handleChangeUserSelectedServer}/>
                        </FormControl>
                        <FormControl>
                            <FormLabel>
                                Nickname
                            </FormLabel>
                            <Input value={selectedNickname} onChange={(e) => setSelectedNickname(e.target.value)} />
                        </FormControl>
                        <Button onClick={handleSubmit}>Submit</Button>
                    </ModalBody>
                </ModalContent>
            </ModalOverlay>
        </Modal>
        </>
    )
}