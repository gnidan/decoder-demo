import util from "util";

import * as Codec from "@truffle/codec";
import * as Decoder from "@truffle/decoder";

import { getEnvironment } from "./src/getEnvironment";
import { getProjectInfo } from "./src/getProjectInfo";
import { getTransactionInfo } from "./src/getTransactionInfo";

decodeStorage({
  contractAddress: "0x53cdb9e6a42394e03132fe077a1e6d0b09df2b59",
  mappingKeys: [
    ["_owners", 0],
    ["_balances", "0xefef50EbACd8DA3c13932ac204361B704Eb8292C"],
    ["_tokenURIs", 0]
  ]
});

async function decodeStorage({
  contractAddress,
  mappingKeys = []
}: {
  contractAddress: string;
  mappingKeys?: [string, ...(string | number)[]][];
}) {
  // initialize provider from environment variables
  const { provider, etherscanKey } = await getEnvironment();

  // uses @truffle/fetch-and-compile for verified contract source
  const projectInfo = await getProjectInfo({
    addresses: [contractAddress],
    provider,
    etherscanKey
  });

  // initialize decoder for specific contract
  const projectDecoder = await Decoder.forProject({
    provider,
    projectInfo
  });
  const decoder = await projectDecoder.forAddress(contractAddress);

  // add desired mapping keys
  for (const [variable, ...indices] of mappingKeys) {
    await decoder.watchMappingKey(variable, ...indices);
  }

  // display decoded state variables
  const variables = await decoder.variables();
  const table = variables.map(variable => ({
    name: variable.name,
    "defined-in": variable.class.typeName,
    value: new Codec.Format.Utils.Inspect.ResultInspector(variable.value)
  }));

  console.table(table);
};
