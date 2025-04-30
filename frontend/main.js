let currentAccount = null;
let adminAccount = null;

// Connect to MetaMask wallet
async function connectWallet() {
  if (window.ethereum) {
    try {
      const accounts = await window.ethereum.request({
        method: "eth_requestAccounts",
      });
      currentAccount = accounts[0];
      document.getElementById("wallet").innerText =
        "Connected: " + currentAccount;

      await fetchAdmin(); // Fetch admin from backend
      checkIfAdmin(); // Check if current account is admin

      await updateStatus();
      await loadCandidates();
    } catch (err) {
      console.error(err);
      alert("Wallet connection failed: " + err.message);
    }
  } else {
    alert("Please install MetaMask to use this DApp.");
  }
}

async function fetchAdmin() {
  try {
    const response = await axios.get("http://localhost:3000/admin");
    adminAccount = response.data.admin.toLowerCase();
    console.log("adminAccount in fetch: ", adminAccount);
  } catch (err) {
    console.error("Failed to fetch admin address:", err);
  }
}

function checkIfAdmin() {
  const adminPanel = document.getElementById("adminPanel");
  console.log("adminAccount in check: ", adminAccount);
  console.log("currentAccount in check: ", currentAccount);

  if (currentAccount && adminAccount) {
    if (currentAccount.toLowerCase() === adminAccount) {
      adminPanel.style.display = "block"; // Show admin panel
    } else {
      adminPanel.style.display = "none"; // Hide admin panel
    }
  }
}

// Load candidates from backend
async function loadCandidates() {
  try {
    const response = await axios.get("http://localhost:3000/candidates");
    const statusResponse = await axios.get(
      `http://localhost:3000/status/${currentAccount}`
    );

    const list = document.getElementById("candidateList");
    list.innerHTML = "";

    const votingOpen = statusResponse.data.votingOpen;

    response.data.candidates.forEach((candidate) => {
      const card = document.createElement("div");
      card.className = "card text-center m-2 p-3";

      const name = document.createElement("h5");
      name.innerText = candidate.name;
      name.className = "card-title";

      const voteInfo = document.createElement("p");
      voteInfo.className = "card-text";

      if (votingOpen) {
        voteInfo.innerText = "Votes will be shown after voting ends.";
      } else {
        voteInfo.innerText = `Votes: ${candidate.votes}`;
      }

      const button = document.createElement("button");
      button.className = "btn btn-outline-primary";
      button.innerText = `Vote for ${candidate.name}`;
      button.onclick = () => vote(candidate.id);
      button.disabled = !votingOpen;

      card.appendChild(name);
      card.appendChild(voteInfo);
      if (votingOpen) {
        card.appendChild(button);
      }

      list.appendChild(card);
    });
  } catch (err) {
    console.error("Failed to load candidates:", err);
    alert("Failed to load candidates: " + err.message);
  }
}

// Cast a vote
async function vote(candidateId) {
  if (!currentAccount) {
    alert("Please connect your wallet first.");
    return;
  }

  try {
    const res = await axios.post("http://localhost:3000/vote", {
      candidateId,
      voterAddress: currentAccount,
    });

    alert("Vote successful!");
    await updateStatus();
    await loadCandidates();
  } catch (err) {
    const message = err.response?.data?.details || err.message;
    alert("Vote failed: " + message);
    console.error("Vote error:", err);
  }
}

// Add candidate (admin only)
async function addCandidate() {
  const name = document.getElementById("candidateName").value;
  if (!currentAccount) return alert("Connect wallet first.");
  if (!name) return alert("Enter a candidate name.");

  try {
    const res = await axios.post("http://localhost:3000/add-candidate", {
      name,
      from: currentAccount,
    });
    alert("Candidate added!");
    await loadCandidates();
  } catch (err) {
    const msg = err.response?.data?.details || err.message;
    alert("Failed to add candidate: " + msg);
  }
}

// Start voting (admin only)
async function startVoting() {
  if (!currentAccount) return alert("Connect wallet first.");
  try {
    const res = await axios.post("http://localhost:3000/start-voting", {
      from: currentAccount,
    });
    alert("Voting started!");
    await updateStatus();
    await loadCandidates();
  } catch (err) {
    const msg = err.response?.data?.details || err.message;
    alert("Failed to start voting: " + msg);
  }
}

// Stop voting (admin only)
async function stopVoting() {
  if (!currentAccount) return alert("Connect wallet first.");
  try {
    const res = await axios.post("http://localhost:3000/stop-voting", {
      from: currentAccount,
    });
    alert("Voting stopped!");
    await updateStatus();
    await loadCandidates();
  } catch (err) {
    const msg = err.response?.data?.details || err.message;
    alert("Failed to stop voting: " + msg);
  }
}

// Update status info
async function updateStatus() {
  if (!currentAccount) return;

  try {
    const res = await axios.get(
      `http://localhost:3000/status/${currentAccount}`
    );

    const votingStatus = res.data.votingOpen
      ? "Voting is OPEN"
      : "Voting is CLOSED";
    const votedStatus = res.data.hasVoted
      ? "You have already voted."
      : "You have not voted yet.";

    document.getElementById("status").innerText = votingStatus;
    document.getElementById("votedStatus").innerText = votedStatus;
  } catch (err) {
    console.error("Error fetching voting status:", err);
    document.getElementById("status").innerText =
      "Unable to fetch voting status.";
  }
}

// Expose key functions to global scope
window.connectWallet = connectWallet;
window.vote = vote;
window.addCandidate = addCandidate;
window.startVoting = startVoting;
window.stopVoting = stopVoting;
