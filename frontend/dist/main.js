var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
import axios from "axios";
let currentAccount = null;
// Connect to MetaMask wallet
function connectWallet() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("connectWallet() triggered");
        if (window.ethereum) {
            try {
                console.log("inside the window connectWallet() triggered");
                const accounts = yield window.ethereum.request({
                    method: "eth_requestAccounts",
                });
                currentAccount = accounts[0];
                const walletDisplay = document.getElementById("wallet");
                if (walletDisplay) {
                    walletDisplay.innerText = "Connected: " + currentAccount;
                }
                updateStatus();
            }
            catch (err) {
                alert("Wallet connection failed: " + err.message);
            }
        }
        else {
            alert("Please install MetaMask to use this DApp.");
        }
    });
}
// Load candidates from backend
function loadCandidates() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios.get("http://localhost:3000/candidates");
            const list = document.getElementById("candidateList");
            if (!list)
                return;
            list.innerHTML = "";
            response.data.candidates.forEach((candidate) => {
                const card = document.createElement("div");
                card.className = "card p-3 mb-2";
                const name = document.createElement("h5");
                name.innerText = `${candidate.name} (${candidate.votes} vote${candidate.votes === "1" ? "" : "s"})`;
                name.className = "mb-2";
                const button = document.createElement("button");
                button.className = "btn btn-outline-primary";
                button.innerText = `Vote for ${candidate.name}`;
                button.onclick = () => vote(candidate.id);
                card.appendChild(name);
                card.appendChild(button);
                list.appendChild(card);
            });
            const totalVotesDisplay = document.getElementById("totalVotes");
            if (totalVotesDisplay && response.data.totalVotes !== undefined) {
                totalVotesDisplay.innerText = `🧮 Total Votes Cast: ${response.data.totalVotes}`;
            }
        }
        catch (err) {
            alert("Failed to load candidates: " + err.message);
        }
    });
}
// Cast a vote
function vote(candidateId) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (!currentAccount) {
            alert("Please connect your wallet first.");
            return;
        }
        try {
            const res = yield axios.post("http://localhost:3000/vote", {
                candidateId,
                voterAddress: currentAccount,
            });
            alert("Vote successful! Tx: " + res.data.tx);
            updateStatus();
            loadCandidates();
        }
        catch (err) {
            const message = ((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.details) || err.message;
            alert("Vote failed: " + message);
        }
    });
}
// Add candidate (admin only)
function addCandidate() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        const nameInput = document.getElementById("candidateName");
        const name = nameInput === null || nameInput === void 0 ? void 0 : nameInput.value;
        if (!currentAccount)
            return alert("Connect wallet first.");
        if (!name)
            return alert("Enter a candidate name.");
        try {
            const res = yield axios.post("http://localhost:3000/add-candidate", {
                name,
                from: currentAccount,
            });
            alert("Candidate added!");
            loadCandidates();
        }
        catch (err) {
            const msg = ((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.details) || err.message;
            alert("Failed to add candidate: " + msg);
        }
    });
}
// Start voting (admin only)
function startVoting() {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        if (!currentAccount)
            return alert("Connect wallet first.");
        try {
            console.log("Start voting from:", currentAccount);
            const res = yield axios.post("http://localhost:3000/start-voting", {
                from: currentAccount,
            });
            alert("Voting started!");
            updateStatus();
        }
        catch (err) {
            const msg = ((_b = (_a = err.response) === null || _a === void 0 ? void 0 : _a.data) === null || _b === void 0 ? void 0 : _b.details) || err.message;
            alert("Failed to start voting: " + msg);
        }
    });
}
// Update voting status
function updateStatus() {
    return __awaiter(this, void 0, void 0, function* () {
        if (!currentAccount) {
            console.log("No account connected");
            return;
        }
        try {
            console.log("Fetching status for", currentAccount);
            const res = yield axios.get(`http://localhost:3000/status/${currentAccount}`);
            const votingStatus = res.data.votingOpen
                ? "Voting is OPEN"
                : "Voting is CLOSED";
            const votedStatus = res.data.hasVoted
                ? "You have already voted."
                : "You have not voted yet.";
            const statusEl = document.getElementById("status");
            const votedStatusEl = document.getElementById("votedStatus");
            if (statusEl)
                statusEl.innerText = votingStatus;
            if (votedStatusEl)
                votedStatusEl.innerText = votedStatus;
            console.log("Status updated successfully");
        }
        catch (err) {
            console.error("Error fetching voting status:", err);
            const statusEl = document.getElementById("status");
            if (statusEl)
                statusEl.innerText = "Unable to fetch voting status.";
        }
    });
}
