import axios from "axios";

let currentAccount: string | null = null;

declare global {
  interface Window {
    ethereum?: any;
  }
}

// Connect to MetaMask wallet
async function connectWallet(): Promise<void> {
  console.log("connectWallet() triggered");

  if (window.ethereum) {
    try {
      console.log("inside the window connectWallet() triggered");

      const accounts: string[] = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      currentAccount = accounts[0];
      const walletDisplay = document.getElementById("wallet");
      if (walletDisplay) {
        walletDisplay.innerText = "Connected: " + currentAccount;
      }
      updateStatus();
    } catch (err: any) {
      alert("Wallet connection failed: " + err.message);
    }
  } else {
    alert("Please install MetaMask to use this DApp.");
  }
}

// Load candidates from backend
async function loadCandidates(): Promise<void> {
  try {
    const response = await axios.get("http://localhost:3000/candidates");
    const list = document.getElementById("candidateList");

    if (!list) return;

    list.innerHTML = "";

    response.data.candidates.forEach(
      (candidate: { id: number; name: string; votes: string }) => {
        const card = document.createElement("div");
        card.className = "card p-3 mb-2";

        const name = document.createElement("h5");
        name.innerText = `${candidate.name} (${candidate.votes} vote${
          candidate.votes === "1" ? "" : "s"
        })`;
        name.className = "mb-2";

        const button = document.createElement("button");
        button.className = "btn btn-outline-primary";
        button.innerText = `Vote for ${candidate.name}`;
        button.onclick = () => vote(candidate.id);

        card.appendChild(name);
        card.appendChild(button);
        list.appendChild(card);
      }
    );

    const totalVotesDisplay = document.getElementById("totalVotes");
    if (totalVotesDisplay && response.data.totalVotes !== undefined) {
      totalVotesDisplay.innerText = `🧮 Total Votes Cast: ${response.data.totalVotes}`;
    }
  } catch (err: any) {
    alert("Failed to load candidates: " + err.message);
  }
}

// Cast a vote
async function vote(candidateId: number): Promise<void> {
  if (!currentAccount) {
    alert("Please connect your wallet first.");
    return;
  }

  try {
    const res = await axios.post("http://localhost:3000/vote", {
      candidateId,
      voterAddress: currentAccount,
    });

    alert("Vote successful! Tx: " + res.data.tx);
    updateStatus();
    loadCandidates();
  } catch (err: any) {
    const message = err.response?.data?.details || err.message;
    alert("Vote failed: " + message);
  }
}

// Add candidate (admin only)
async function addCandidate(): Promise<void> {
  const nameInput = document.getElementById(
    "candidateName"
  ) as HTMLInputElement;
  const name = nameInput?.value;
  if (!currentAccount) return alert("Connect wallet first.");
  if (!name) return alert("Enter a candidate name.");

  try {
    const res = await axios.post("http://localhost:3000/add-candidate", {
      name,
      from: currentAccount,
    });
    alert("Candidate added!");
    loadCandidates();
  } catch (err: any) {
    const msg = err.response?.data?.details || err.message;
    alert("Failed to add candidate: " + msg);
  }
}

// Start voting (admin only)
async function startVoting(): Promise<void> {
  if (!currentAccount) return alert("Connect wallet first.");
  try {
    console.log("Start voting from:", currentAccount);
    const res = await axios.post("http://localhost:3000/start-voting", {
      from: currentAccount,
    });
    alert("Voting started!");
    updateStatus();
  } catch (err: any) {
    const msg = err.response?.data?.details || err.message;
    alert("Failed to start voting: " + msg);
  }
}

// Update voting status
async function updateStatus(): Promise<void> {
  if (!currentAccount) {
    console.log("No account connected");
    return;
  }

  try {
    console.log("Fetching status for", currentAccount);
    const res = await axios.get(
      `http://localhost:3000/status/${currentAccount}`
    );

    const votingStatus = res.data.votingOpen
      ? "Voting is OPEN"
      : "Voting is CLOSED";
    const votedStatus = res.data.hasVoted
      ? "You have already voted."
      : "You have not voted yet.";

    const statusEl = document.getElementById("status");
    const votedStatusEl = document.getElementById("votedStatus");

    if (statusEl) statusEl.innerText = votingStatus;
    if (votedStatusEl) votedStatusEl.innerText = votedStatus;

    console.log("Status updated successfully");
  } catch (err: any) {
    console.error("Error fetching voting status:", err);
    const statusEl = document.getElementById("status");
    if (statusEl) statusEl.innerText = "Unable to fetch voting status.";
  }
}
