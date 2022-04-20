import util from "util";
import Web3 from "web3";

import * as Codec from "@truffle/codec";
import * as Decoder from "@truffle/decoder";

import { getProjectInfo } from "./src/getProjectInfo";
import { getTransactionInfo } from "./src/getTransactionInfo";
import { getEnvironment } from "./src/getEnvironment";

decode({
  transactionHash: "0x211846abc2448cea3de1cfd4e6ac2efb2ec44516e18ad490ffb89ea66f400ef8"
});

async function decode({
  transactionHash,
  showLogs = false,
  raw = false
}: {
  transactionHash: string;
  showLogs?: boolean;
  raw?: boolean;
}) {
  // initialize provider from environment variables
  const { provider, etherscanKey } = await getEnvironment();

  // read transaction and receipt
  const { transaction, logs, relatedAddresses } = await getTransactionInfo({
    transactionHash,
    provider
  });

  // uses @truffle/fetch-and-compile for verified contract source
  const projectInfo = await getProjectInfo({
    addresses: relatedAddresses,
    provider,
    etherscanKey
  });

  // initialize decoder
  const decoder = await Decoder.forProject({
    provider,
    projectInfo
  });

  // perform decoding
  const decoding = await decoder.decodeTransaction(transaction);

  // print output
  console.group("Transaction");
  if (raw) {
    console.log(
      util.inspect(decoding, { colors: true, depth: null })
    );
  } else {
    console.log(
      new Codec.Export.CalldataDecodingInspector(decoding)
    );
  }
  console.groupEnd();

  if (showLogs) {
    console.group("Logs");
    for (const log of logs) {
      // console.debug("log %o", log);
      const decodings = await decoder.decodeLog(log);
      const decoding = decodings[0];
      if (decoding) {
        if (raw) {
          console.log(
            util.inspect(decoding, { colors: true, depth: null })
          );
        } else {
          console.log(
            new Codec.Export.LogDecodingInspector(decoding)
          );
        }
      } else {
        console.log("- <could not decode event>");
      }
    }
    console.groupEnd();
  }
}
