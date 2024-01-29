import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    Input,
    Button,
    FormControl,
    FormLabel,
    useToast
  } from '@chakra-ui/react'
import { useContext, useState } from 'react'
import { PeerContext } from '../contexts/PeerProvider'

import { checkSignalServer } from '../utilities/peerjs'

export const SettingsModal = (props) => {
    
    const { id, signalServer, setSignalServer, nickname, setNickname } = useContext(PeerContext)
    const [newSignalServer, setNewSignalServer] = useState(signalServer)
    const [newNickname, setNewNickname] = useState(nickname)
    const serverToast = useToast()

    const handleSaveServer = () => {
        checkSignalServer(newSignalServer).then((res) => {
            setSignalServer(newSignalServer)
            serverToast(
                {
                    title: 'Success',
                    description: "Successfully set signal server address",
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

    const handleSaveNickname = () => {
        setNickname(newNickname)
        serverToast(
            {
                title: 'Success',
                description: "Successfully set new nickname",
                status: 'success',
                duration: 9000,
                isClosable: true,
            }
        )
    }

    return(
        <Modal isOpen={props.isOpen} onClose={props.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>Settings</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            UUID: {id}
            <FormControl>
                <FormLabel>
                    Signal Server Address
                </FormLabel>
                <Input value={newSignalServer} onChange={(e) => setNewSignalServer(e.target.value)}/>
                <Button onClick={handleSaveServer}>Save</Button>
            </FormControl>
            <FormControl>
                <FormLabel>
                    Nickname
                </FormLabel>
                <Input value={newNickname} onChange={(e) => setNewNickname(e.target.value)}/>
                <Button onClick={handleSaveNickname}>Save</Button>
            </FormControl>

          </ModalBody>
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={props.onClose}>
                Close
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )
}