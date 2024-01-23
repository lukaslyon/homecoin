class Transaction{
    constructor(timestamp, creator, from, to, amount, label, signature){
        this.timestamp = timestamp
        this.creator = creator
        this.from = from
        this.to = to
        this.amount = amount
        this.label = label
        this.signature = signature
    }
}

class Block{
    constructor(transaction, miner, timestamp, previous, nonce){
        this.transaction = transaction
        this.miner = miner
        this.header = {
            "timestamp": timestamp,
            "previous": previous,
            "nonce": nonce
        }
    }
}

class Chain{
    constructor(){
        this.chain = []
    }

    assignGenesisBlock(){
        tx = new Transaction(Date.now(), 0, 0, 0, 0, "genesis block", 0)
        blk = new Block(tx, 0, Date.now(), 0, 0)
        this.chain.push(blk)
    }
}