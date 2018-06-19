const SHA256 = require('crypto-js/sha256');
let moment = require('moment');

class Transaction{
    constructor(fromAddress, toAddress, amount, name, dest, org, flight, airLine){
        this.fromAddress = fromAddress;
        this.toAddress = toAddress;
        this.amount = amount;
        this.name = name;
        this.dest = dest;
        this.org = org;
        this.flight = flight;
        this.airLine = airLine;
    }
}

//Block of the blockchain
class Block{
    
    /**
     * 
     * @param {*} timestap 
     * @param {*} transactions 
     * @param {*} previousHash 
     */
    constructor(timestap, transactions, previousHash = ''){
        this.timestap = timestap;
        this.transactions = transactions;
        this.previousHash = previousHash;
        this.hash = this.calculateHash(); // Contains the hash of the block
        this.nonce = 0;
    }

    /**
     * Function to calculate SHA256 hash for a block
     * NPM Package crypto-js
     */
    calculateHash(){
        return SHA256(this.index + this.previousHash + this.timestap + JSON.stringify(this.data) + this.nonce).toString();
    }

    /**
     * 
     * @param {*} difficulty 
     */
    mineBlock(difficulty){
        //While loop that keeps running until the hash starts with enough 0s
        //making a string of 0s that is exactly the length of difficulty
        while(this.hash.substring(0, difficulty) !== Array(difficulty + 1).join("0")){

            //the hash of the block wont change unless we change the contents of our block
            //add a nonce value: random number not associated to the block but can be changed to random
            this.nonce++;
            this.hash = this.calculateHash();
        }

        console.log('Block mined: ' + this.hash);
    }
}

//
class Blockchain{
    /**
     * Initializes the blockchain
     */
    constructor(){
        //first block is called genesis block
        //manually added
        this.chain = [this.createGenesisBlock()];
        //2 for example pueposes
        this.difficulty = 2;
        //pending transactions
        this.pendingTransactions = [];
        //reward for mining
        this.miningReward = 100;
    }

    /**
     * First block in the blockchain
     */
    createGenesisBlock(){
        return new Block(moment.utc().format(), [], "0");
    }

    /**
     * Returns the last block added to the chain
     */
    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    /**
     * A miner calls this and will pass along wallet address to identify where to send the reward
     * You cant add all pending transactions to a block because there could be many and block size cannot increase 1MB(bitcoin)
     * @param {*} miningRewardAddress 
     */
    minePendingTransactions(miningRewardAddress){
        let block = new Block(moment.utc().format(), this.pendingTransactions);
        block.mineBlock(this.difficulty);
        console.log('minePendingTransactions()');
        this.chain.push(block);

        //Reset pending transactions
        //Create a new transaction to give the miner the reward
        //this.pendingTransactions = [];
        this.pendingTransactions = [
            new Transaction(null, miningRewardAddress, this.miningReward)
        ];
    }

    /**
     * Add to the pending transactions
     * @param {*} transaction 
     */
    createTransaction(transaction){
        this.pendingTransactions.push(transaction);
    }

    /**
     * Checks the balance of an address
     * Bitcoin exchange doesnt move from wallet to wallet
     * The transaction is just stored in the blockchain 
     * To get balances you have to go through all the transactions for your address
     * @param {*} address 
     */
    getBalanceOfAddress(address){
        let balance = 0;
        for(const block of this.chain){
            for(const trans of block.transactions){
                if(trans.fromAddress === address){
                    balance -= trans.amount;
                }

                if(trans.toAddress === address){
                    balance += trans.amount;
                }
            }
        }

        return balance;
    }

    /**
     * Validate integrity of the chain
     */
    isChainValid(){
        //Loop over chain
        //Block 0 is genesis block starting with the one after that
        for(let i = 1; i < this.chain.length; i++){
            const currentBlock = this.chain[i];
            const previousBlock = this.chain[i -1];

            //check the hash of the blocks is still valid
            if(currentBlock.hash !== currentBlock.calculateHash()){
                return false
            }

            //check if the block points to a correct previous block
            if(currentBlock.previousHash !== previousBlock.hash){
                return false;
            }  
        }

        //if the chain looks valid
        return true;
    }
}

let dataChain = new Blockchain();

dataChain.createTransaction(new Transaction('John','MCO', 'TPA', '115','JBlue'));
dataChain.createTransaction(new Transaction('Jim','MCO', 'BDL', '115','JBlue'));
dataChain.createTransaction(new Transaction('Jason','MCO', 'BDL', '115','JBlue'));
dataChain.createTransaction(new Transaction('Patrick','MCO', 'BDL', '115','JBlue'));


console.log('Starting to mine');
dataChain.minePendingTransactions('andrew');

console.log('Balance of andrew is', dataChain.getBalanceOfAddress('andrew'));

console.log('Starting the miner again which will mine the reward transaction...');
dataChain.minePendingTransactions('andrew');

console.log('Balance of andrew is', dataChain.getBalanceOfAddress('andrew'));

/**
 * NOTES
 * Blocks can contain multiple data sets
 * Add rewards for mining
 */