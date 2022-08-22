//import
//in nodejs uses require to add frameworks or other files
//front end javascript uses import
import { ethers } from "./ethers-5.6.esm.min.js"
import { abi, contractAddress } from "./constants.js"

const connectButton = document.getElementById("connectButton")
const fundButton = document.getElementById("fundButton")
const balanceButton = document.getElementById("balanceButton")
const withdrawButton = document.getElementById("withdrawButton")
const balanceLabel = document.getElementById("balanceLabel")
const errorMessage = document.getElementById("ErrorMessage")
connectButton.onclick = connect
fundButton.onclick = fund
balanceButton.onclick = getBalance
withdrawButton.onclick = withdraw

async function connect() {
    if (typeof window.ethereum !== "undefined") {
        console.log("I see a metamask!")
        try {
            await window.ethereum.request({ method: "eth_requestAccounts" })
        } catch (error) {
            console.log(error)
        }
        console.log("Connected wallet")
        connectButton.innerHTML = "Connected"
        const accounts = await ethereum.request({ method: "eth_accounts" })
        console.log(accounts)
    } else {
        console.log("no metamask!")
        connectButton.innerHTML = "Please install metamask"
    }
}

async function getBalance() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        const balance = await provider.getBalance(contractAddress)
        console.log(ethers.utils.formatEther(balance))
        balanceLabel.innerText = `Current Balance: ${ethers.utils.formatEther(
            balance
        )}`
    } else {
    }
}

//fund function
async function fund() {
    const ethAmount = document.getElementById("ethAmount").value
    console.log(`Funding with ${ethAmount}`)
    if (typeof window.ethereum !== "undefined") {
        //provider / connection to the block chain
        //signer / wallet / someone with gas
        // contract that we are interacting with
        //^ ABI & Address
        //provider

        //provider would be metamask, meta mask has connection to block chain to
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        //gets the current wallet that is connected
        const signer = provider.getSigner()
        console.log(signer)
        //now time to get contract, we will need to know address and abi
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const transactionResponse = await contract.fund({
                value: ethers.utils.parseEther(ethAmount),
            })
            //how do we show user that this went thru or not
            //2 ways
            //list for the tx to be mined
            //listed for an event <- we haven't learned about yet!
            await listenForTransactionMine(transactionResponse, provider)
            await getBalance()
            console.log("done")
        } catch (error) {
            console.log(error)
        }
    }
}

function listenForTransactionMine(transactionResponse, provider) {
    console.log(`Mining ${transactionResponse.hash}...`)
    //create a listener for transcation to finish
    // provider.once(transactionResponse.hash, (transactionReceipt) => {
    //     //this is anomous function
    //     console.log(
    //         `completed with ${transactionReceipt.confirmations} confirmations`
    //     )
    // })
    //we want this listner to finish listening before continuing to accomplish this we need Promises
    //return new Promise()
    return new Promise((resolve, reject) => {
        //create a listener for transcation to finish
        provider.once(transactionResponse.hash, (transactionReceipt) => {
            //this is anomous function
            console.log(
                `completed with ${transactionReceipt.confirmations} confirmations`
            )
            //call resolve when finished (use reject for timeout)
            //promise will only resolve only after resolve or reject is called
            resolve()
        })
    })
}

//withdraw

async function withdraw() {
    if (typeof window.ethereum !== "undefined") {
        const provider = new ethers.providers.Web3Provider(window.ethereum)
        //gets the current wallet that is connected
        const signer = provider.getSigner()
        const contract = new ethers.Contract(contractAddress, abi, signer)
        try {
            const tranasctionResponse = await contract.withdraw()
            await listenForTransactionMine(tranasctionResponse, provider)
        } catch (error) {
            console.log(error)
            console.log(error.reason.includes("FundMe__NotOwner"))
            showError(error)
        }
    } else {
    }
}

function showError(error) {
    if (error.reason.includes("FundMe__NotOwner")) {
        errorMessage.innerText =
            "Can not withdraw if you are not owner of contract"
        errorMessage.fontColor = "#ff0000"
    }
}
