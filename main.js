const SHA256 = require('crypto-js/sha256');
let moment = require('moment');

//Block of the blockchain
class Block{
    /**
     * 
     * @param {*} index where the block sits on the chain
     * @param {*} timestap when the block was created
     * @param {*} data data associated to the block - details of the transaction can be added here
     * @param {*} previousHash string hash of the previous block in the chain
     */
    constructor(index, timestap, data, previousHash = ''){
        this.index = index;
        this.timestap = timestap;
        this.data = data;
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
    }

    /**
     * First block in the blockchain
     */
    createGenesisBlock(){
        return new Block(0,  moment.utc().format(), "Genesis block", "0");
    }

    /**
     * Returns the last block added to the chain
     */
    getLatestBlock(){
        return this.chain[this.chain.length - 1];
    }

    /**
     * Generally not as easy to add new blocks
     * There should be more checks in place
     * @param {*} newBlock 
     */
    addBlock(newBlock){
        newBlock.previousHash = this.getLatestBlock().hash;
        //newBlock.hash = newBlock.calculateHash();
        //added mining for new block
        newBlock.mineBlock(this.difficulty);
        this.chain.push(newBlock);
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

let lostSuitCasesChain = new Blockchain();
console.log('Mine 1');
lostSuitCasesChain.addBlock(new Block(1,  moment.utc().format(), { name: 'Francisco', dest: 'MCO', org:'TPA', flight:'11521', airLine:'JBLUE' }));
console.log('Mine 2');
lostSuitCasesChain.addBlock(new Block(1, moment.utc().format(), { name: 'Tim', dest: 'MCO', org:'TPA', flight:'11521', airLine:'JBLUE' }));

//console.log('Is blockchain valid? ' +  lostSuitCasesChain.isChainValid());
//console.log(JSON.stringify(lostSuitCasesChain));

//Tampering with the block will be invalid because has is different
//lostSuitCasesChain.chain[1].data = { name: 'Francisco', dest: 'MCO', org:'BDL', flight:'11521', airLine:'JBLUE' };
//re-calculate hash of tampered block wont work because relationship has been broken
//lostSuitCasesChain.chain[1].hash = lostSuitCasesChain.chain[1].calculateHash();

//console.log('Is blockchain valid? ' +  lostSuitCasesChain.isChainValid());

/**
 * The blockchain is meant to add blocks to it but to never delete a block or to never change a block
 * If a blockchain is detected to be broken with a new block there should a rollback mechanism
 */

/**NOTES
 * We dont want people to created hunderds of thousand of block per second and spam the chain
 * Security: You can change the contents of the block and re calculate the hash for the whole chain and end up with a valid chain
 */

/** SOLUTION  
 * Blockchains have something called PROOF OF WORK
 * With this mechanism you have to prove that you put a lot of computing power to create a block
 * This process is also called Mining
 * This can be achieved by example of Bitcoin which requires the hash of a block to begin with a certain amount of 0 and because you
 * cant influence the output of a hash function you have to try a lot of combinations that has the required number 0s
 * Also called difficulty and set so that blocks are added in a steady amount: eg. 1 block every 10min
 * To compensate for fast computing power the difficulty is simply increased
 */