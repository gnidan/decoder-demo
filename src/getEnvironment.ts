import Web3 from "web3";

export const getEnvironment = async () => {
  const rpcUrl = process.env.MAINNET_URL || "";
  const etherscanKey = process.env.ETHERSCAN_KEY || "";

  const web3 = new Web3(rpcUrl);
  const provider = web3.currentProvider as any;

  return { provider, etherscanKey };
};
