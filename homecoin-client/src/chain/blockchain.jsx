import { digest, hexToPublicKey, sign, verifySignature } from "../crypto/subtle";

const zero256Hex = 0x0000000000000000000000000000000000000000000000000000000000000000;
const zero64Hex = 0x0000000000000000;

export class Transaction{
    constructor(timestamp, from, to, amount, label){
        this.contents = {
            timestamp: timestamp,
            from: from,
            to: to,
            amount: amount,
            label: label
        }
    }

    async sign(key) {
        sign(key, this.contents).then((signature) => {
            this.signature = signature
        })
    }

    manualSign(signature) {
        this.signature = signature
    }

    verify() {
        return new Promise((res, rej) => {
            hexToPublicKey(this.contents.from)
            .then((key) => {
                verifySignature(key, this.contents, this.signature)
                .then((valid) => {
                    res(valid)
                })
            })
        })
    }
}

export const serializeTransaction = (tx) => {
    return {
        "timestamp": tx.contents.timestamp,
        "from": tx.contents.from,
        "to": tx.contents.to,
        "amount": tx.contents.amount,
        "label": tx.contents.label,
        "signature": tx.signature
    }
}

export const reconstructTransaction = (tx) => {
    const _tx = new Transaction(tx.timestamp, tx.from, tx.to, tx.amount, tx.label)
    _tx.manualSign(tx.signature)
    return _tx
}

export class Block{
    constructor(version, prevHash, timestamp, bits, tx){
        this.header = {
            "version": version,
            "prevHash": prevHash,
            "timestamp": timestamp,
            "bits": bits,
            "nonce": 0,
        }
        this.metadata = {
            "mineTime": null
        }
        this.tx = tx
    }

    setMerkleRoot = async () => {
        digest(this.tx).then((hash) => {
            this.header.merkleRoot = hash
        })
    }

    setMerkleRootManual = (_merkleRoot) => {
        this.header.merkleRoot = _merkleRoot
    }

    updateNonce(){
        this.header.nonce = this.header.nonce + 1
    }

    setNonceManual(n){
        this.header.nonce = n
    }

    setMineTimeManual(t){
        this.metadata.mineTime = t
    }

    async mine(){
        var hash
        var start = Date.now()
        await digest(this.header).then((_hash) => {
            hash = _hash
        })
        while (Number("0x"+hash) >= 2**this.header.bits){
            this.updateNonce()
            await digest(this.header).then((_hash) => {
                hash = _hash
            })
        }
        var end = Date.now()
        console.log("Mined Block")
        console.log(`Previous Hash: ${this.header.prevHash}`)
        //console.log(hash)
        //console.log(`Time taken to mine: ${end-start}ms`)
        this.metadata.mineTime = end-start
        return "success"
    }

    getHash(){
        digest(this.header).then((_hash) => {
            console.log(`Hash: ${_hash}`)
        })
    }

    verify(){
        return new Promise((res, rej) => {
            digest(this.header).then((_hash) => {
                if (Number("0x"+_hash) < 2**this.header.bits){
                    res(true)
                }
                else res(false)
            })
            .catch((err) => {
                rej(err)
            })
        })
    }
}

export const serializeBlock = (block) => {
    return {
        "header": {
            "version": block.header.version,
            "prevHash": block.header.prevHash,
            "timestamp": block.header.timestamp,
            "bits": block.header.bits,
            "nonce": block.header.nonce,
            "merkleRoot": block.header.merkleRoot
        },
        "metadata": {
            "mineTime": block.metadata.mineTime
        },
        "tx": serializeTransaction(block.tx)
    }
}

export const reconstructBlock = (blk) => {
    const _tx = reconstructTransaction(blk.tx)
    const _blk = new Block(blk.header.version, blk.header.prevHash, blk.header.timestamp, blk.header.bits, _tx)
    _blk.setNonceManual(blk.header.nonce)
    _blk.setMerkleRootManual(blk.header.merkleRoot)
    _blk.setMineTimeManual(blk.metadata.mineTime)
    return(_blk)
}

export class Chain{
    constructor(_chain=[]){
        this.chain = _chain
    }

    async assignGenesisBlock(){

        const genesisSignature = "a3ebf73637c53929f7bcaefd30b06dd00eaeed49507602f70ff828f03485743e8a811d83323f95c64c31f9b1aca3c61da1899223c2552533741b8be90a6b98c69f5b793f5c4c150436187ba0d4b5eaf6fc9e673123bdb9f8e601804311a7e84472237179448cb4bb72316d0d498dfad03b6c56a05ca11e0e547289b1e4e72182f15aeae0ef18bbb720ff324a9bf9904762546a6d4e85d6cb9dea7e7d63ac25025442af7a56b31e6d30aa35f5129189cfd6352828f418709d4bccb06aa8beb9e6ee42f2b9c686b5415c3aee59de968ec9bfcc61d823b3603fc64123ffd3e392f6b0df4bd908c82463c7c1d29a2d30f7aa4a0caebb4bea21a9c53d89459fe360f6"
        const genesisNode = "30820122300d06092a864886f70d01010105000382010f003082010a0282010100b1e383fb1960fdb8ccfe4654220d3f1c5f41d2977bf7475502d4ebc589b3543dfd8584da34a13a39299678f95df218e9262c101f12f07b780c321fa6e25be215ec25d9578c1261ad61249c6a5c8937fe01bd04c48cf906a5fe47ae244729f46b835fc2f48dbbc98bb169d8b617c58081305477abfe86e2a9e7e000593d56ce44709bba4e03ba5089f3fd3eccab94e511fece910b3604e869c952c96701834e89c59d4bb29177ecea503991dcda187b0f3d75dcf9e994443bd1c101ba68d8e4d678f18f6bf5dbe677f00bf174813bbd268bc39e457c7c28faed177e561425fe2b5e832703c09f3c10fbce678c3398a2385b1a7c45f5ac6ff354bb437fe833f9930203010001"

        const tx = new Transaction(0, genesisNode, genesisNode, zero64Hex, "welcome home")
        tx.manualSign(genesisSignature)
        const blk = new Block(1, zero256Hex,0,145,tx)
        await blk.setMerkleRoot()
        await blk.mine()

        this.chain.push(blk)
    }
}

export const serializeChain = (chain) => {
    const _chain = []
    chain.chain.forEach((b) => {
        const _blk = serializeBlock(b)
        _chain.push(_blk)
    })
    return {
        "chain": _chain
    }
}

export const reconstructChain = (chain) => {
    const _chain = []
    chain.chain.forEach((b) => {
        const _blk = reconstructBlock(b)
        _chain.push(_blk)
    })

    return new Chain(_chain)
}

export const reconstructUnminedBlocks = (blocks) => {
    const _blocks = []
    blocks.forEach((b) => {
        const _blk = reconstructBlock(b)
        _blocks.push(_blk)
    })
    return _blocks
}

export const serializeUnminedBlocks = (blocks) => {
    const _chain = []
    blocks.forEach((b) => {
        const _blk = serializeBlock(b)
        _chain.push(_blk)
    })
    return _chain
}