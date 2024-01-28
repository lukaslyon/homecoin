import {
    Modal,
    ModalOverlay,
    ModalContent,
    ModalHeader,
    ModalFooter,
    ModalBody,
    ModalCloseButton,
    FormControl,
    FormLabel,
    Select,
    Button,
    Input
  } from '@chakra-ui/react'

  import {
    NumberInput,
    NumberInputField,
    NumberInputStepper,
    NumberIncrementStepper,
    NumberDecrementStepper,
  } from '@chakra-ui/react'
import { useContext, useState } from 'react'
import { PeerContext } from '../contexts/PeerProvider'
import { UnminedBlock, Transaction, bits, version } from '../chain/blockchain'
import { KeyContext } from '../contexts/KeyProvider'
import { digest, publicKeyToHex } from '../crypto/subtle'
import { ChainContext } from '../contexts/ChainProvider'

  export const RequestModal = (props) => {

    const {historicalPeers} = useContext(PeerContext)
    const [recipient, setRecipient] = useState("")
    const [memo, setMemo] = useState("")
    const [amount, setAmount] = useState(0)

    const {keyPair, publicHex} = useContext(KeyContext)
    const { chain, unminedBlocks, updateUnminedBlocks } = useContext(ChainContext)

    const handleChangeRecipient = (e) => {
        setRecipient(e.target.value)
    }

    const handleChangeMemo = (e) => {
        setMemo(e.target.value)
    }

    const handleChangeAmount = (e) => {
        setAmount(e)
    }

    const handleSubmitTransaction = async () => {
        const _tx = new Transaction(Date.now(), publicHex, recipient, amount, memo)
        await _tx.sign(keyPair.privateKey)
        const _blk = new UnminedBlock(version, Date.now(), bits, [_tx])
        await _blk.setId()
        updateUnminedBlocks([...unminedBlocks, _blk])
        setRecipient("")
        setMemo("")
        setAmount(0)
        props.onClose()
    }

    return(
        <Modal isOpen={props.isOpen} onClose={props.onClose}>
        <ModalOverlay />
        <ModalContent>
          <ModalHeader>New Transaction</ModalHeader>
          <ModalCloseButton />
          <ModalBody>
            <FormControl>
                <FormLabel>
                    Recipient
                </FormLabel>
                <Select placeholder="Select recipient" value={recipient} onChange={handleChangeRecipient}>
                    {historicalPeers.map((p) => {
                        return(
                            <option value = {p.publicKey} key={p.label}>
                                {p.label}
                            </option>
                        )
                    })}
                </Select>
            </FormControl>
            <FormControl>
                <FormLabel>
                    Memo
                </FormLabel>
                <Input placeholder="Enter a transaction memo" value={memo} onChange={handleChangeMemo}/>
            </FormControl>
            <FormControl>
                <FormLabel>
                    Amount
                </FormLabel>
                    <NumberInput value={amount} onChange={handleChangeAmount}>
                        <NumberInputField />
                        <NumberInputStepper>
                            <NumberIncrementStepper />
                            <NumberDecrementStepper />
                        </NumberInputStepper>
                    </NumberInput>
            </FormControl>
          </ModalBody>
    
          <ModalFooter>
            <Button colorScheme='blue' mr={3} onClick={handleSubmitTransaction}>
                Submit
            </Button>
            <Button variant='ghost' onClick={props.onClose}>Close</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    )

  }