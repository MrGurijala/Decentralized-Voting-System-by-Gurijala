require("dotenv").config();
const express = require("express");
const Web3 = require("web3");
const contractData = require("../build/contracts/Voting.json");

const app = express();
app.use(express.json());

const web3 = new Web3(new Web3.providers.HttpProvider(process.env.RPC_URL));
const networkId = Object.keys(contractData.networks)[0];
const votingContract = new web3.eth.Contract(
  contractData.abi,
  process.env.CONTRACT_ADDRESS
);

// 1. Get all candidates
app.get("/candidates", async (req, res) => {
  try {
    const count = await votingContract.methods.candidateCount().call();
    const candidates = [];

    for (let i = 1; i <= count; i++) {
      const candidate = await votingContract.methods.getCandidate(i).call();
      candidates.push({ id: i, name: candidate[0], votes: candidate[1] });
    }

    res.json({ candidates });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to fetch candidates", details: err.message });
  }
});

// 2. Cast a vote
app.post("/vote", async (req, res) => {
  const { candidateId, voterAddress } = req.body;

  try {
    const receipt = await votingContract.methods.vote(candidateId).send({
      from: voterAddress,
      gas: 200000,
    });

    res.json({ message: "Vote submitted", tx: receipt.transactionHash });
  } catch (err) {
    res.status(500).json({ error: "Voting failed", details: err.message });
  }
});

app.listen(3000, () => {
  console.log("Backend API running on http://localhost:3000");
});
