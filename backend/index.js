require("dotenv").config();
const express = require("express");
const Web3 = require("web3");
const cors = require("cors");

const contractData = require("../build/contracts/Voting.json");

const app = express();
app.use(cors());
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

// 3. Add candidate
app.post("/add-candidate", async (req, res) => {
  const { name, from } = req.body;

  try {
    const tx = await votingContract.methods.addCandidate(name).send({
      from,
      gas: 200000,
    });

    res.json({ message: "Candidate added", tx: tx.transactionHash });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to add candidate", details: err.message });
  }
});

//4. Start voting
app.post("/start-voting", async (req, res) => {
  const { from } = req.body;

  try {
    const tx = await votingContract.methods.startVoting().send({
      from,
      gas: 100000,
    });

    res.json({ message: "Voting started", tx: tx.transactionHash });
  } catch (err) {
    res
      .status(500)
      .json({ error: "Failed to start voting", details: err.message });
  }
});

app.get("/status/:address", async (req, res) => {
  const votingOpen = await votingContract.methods.votingOpen().call();
  const hasVoted = await votingContract.methods
    .voters(req.params.address)
    .call();
  res.json({ votingOpen, hasVoted });
});

app.post("/stop-voting", async (req, res) => {
  const { from } = req.body;
  try {
    const receipt = await contract.methods.endVoting().send({ from });
    res.json({ tx: receipt.transactionHash });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ error: "Failed to stop voting", details: error.message });
  }
});

app.listen(3000, () => {
  console.log("Backend API running on http://localhost:3000");
});
