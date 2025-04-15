// SPDX-License-Identifier: MIT
pragma solidity ^0.5.15;

contract Voting {
    address public admin;
    bool public votingOpen;

    struct Candidate {
        uint id;
        string name;
        uint voteCount;
    }

    uint public candidateCount;
    mapping(uint => Candidate) public candidates;
    mapping(address => bool) public voters;

    event CandidateAdded(uint id, string name);
    event VotingStarted();
    event VotingEnded();
    event Voted(address indexed voter, uint indexed candidateId);

    constructor() public {
        admin = msg.sender;
        votingOpen = false;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "Only admin can perform this action");
        _;
    }

    modifier votingActive() {
        require(votingOpen, "Voting is not currently open");
        _;
    }

    function addCandidate(string memory _name) public onlyAdmin {
        candidateCount++;
        candidates[candidateCount] = Candidate(candidateCount, _name, 0);
        emit CandidateAdded(candidateCount, _name);
    }

    function startVoting() public onlyAdmin {
        votingOpen = true;
        emit VotingStarted();
    }

    function endVoting() public onlyAdmin {
        votingOpen = false;
        emit VotingEnded();
    }

    function vote(uint _candidateId) public votingActive {
        require(!voters[msg.sender], "You have already voted");
        require(_candidateId > 0 && _candidateId <= candidateCount, "Invalid candidate ID");

        voters[msg.sender] = true;
        candidates[_candidateId].voteCount++;
        emit Voted(msg.sender, _candidateId);
    }

    function getCandidate(uint _candidateId) public view returns (string memory, uint) {
        Candidate memory candidate = candidates[_candidateId];
        return (candidate.name, candidate.voteCount);
    }
}
