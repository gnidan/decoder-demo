import Web3 from "web3";

export interface GetTransactionInfoOptions {
  transactionHash: string;
  provider: any;
}

export const getTransactionInfo = async ({
  transactionHash,
  provider
}: GetTransactionInfoOptions) => {
  const web3 = new Web3(provider);

  const {
    to,
    blockNumber,
    from,
    input
  } = await web3.eth.getTransaction(transactionHash);
  const {
    contractAddress,
    logs
  } = await web3.eth.getTransactionReceipt(transactionHash);

  const relatedAddresses = Array.from(new Set([
    to,
    contractAddress,
    ...logs.map(({ address }) => address)
  ])).filter(
    (address: string | undefined | null): address is string => !!address
  );

  return {
    transaction: {
      to,
      from,
      input,
      blockNumber
    },
    logs,
    relatedAddresses
  };
}
