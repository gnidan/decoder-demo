import Web3 from "web3";
import Config from "@truffle/config";
import { fetchAndCompileMultiple } from "@truffle/fetch-and-compile";

export interface GetProjectInfoOptions {
  addresses: string[];
  provider: any;
  etherscanKey: string;
}

export const getProjectInfo = async ({
  addresses,
  provider,
  etherscanKey
}: GetProjectInfoOptions) => {
  const web3 = new Web3(provider);
  const networkId = await web3.eth.net.getId();

  const config = Config.default().merge({
    networks: {
      decoder: {
        provider,
        network_id: networkId
      }
    },
    network: "decoder",
    sourceFetchers: ["sourcify", "etherscan"],
    quiet: true,
    compilers: {
      solc: {
        docker: true
      }
    },
    etherscan: {
      apiKey: etherscanKey
    }
  });

  const { results } = await fetchAndCompileMultiple(
    addresses,
    config as any
  );

  const commonCompilations = Object.values(results)
    .map(({ compileResult }) => compileResult.compilations)
    .reduce((a, b) => ([...a, ...b]), []);

  return { commonCompilations };
};
