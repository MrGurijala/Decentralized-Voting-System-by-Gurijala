require("dotenv").config();
const HDWalletProvider = require("@truffle/hdwallet-provider");

module.exports = {
  networks: {
    development: {
      host: "127.0.0.1",
      port: 7545,
      network_id: "*",
    },
    //   sepolia: {
    //     provider: () =>
    //       new HDWalletProvider(
    //         process.env.DEPLOYER_PRIVATE_KEY,
    //         process.env.ALCHEMY_URL
    //       ),
    //     network_id: 11155111,
    //     gas: 5500000,
    //     confirmations: 2,
    //     timeoutBlocks: 200,
    //     skipDryRun: true,
    //   },
    // },
    // compilers: {
    //   solc: {
    //     version: "0.8.20",
    //   },
  },
};
