import util from "util";

import * as Codec from "@truffle/codec";
import * as Decoder from "@truffle/decoder";

import { getEnvironment } from "./src/getEnvironment";
import { getProjectInfo } from "./src/getProjectInfo";
import { getTransactionInfo } from "./src/getTransactionInfo";

decode({
  transactionHash: "0x8b47bc5d253acf848d9693fc410072591a6222ae625cc5e5f5ddf86fcdccc85b",
  showLogs: true
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
