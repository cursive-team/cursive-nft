import { ethers } from "ethers";
import path from "path";
require("dotenv").config();
import DeployModule from "./../solidity/ignition/deployments/chain-11155111/artifacts/DeployModule#Cursive.json";
import { CircuitSignals, plonk } from "snarkjs";
const INFURA_URL = process.env.INFURA_URL as string;
const WALLET_PRIVATE_KEY = process.env.PRIVATE_KEY as string;

const CONTRACT_ADDRESS = "0x5962CFd168d331E135427DA77be84B7212441d04";

export class Cursive {
  private provider: ethers.JsonRpcProvider;
  private signer: ethers.Wallet;
  private contract: ethers.Contract;

  constructor() {
    if (!INFURA_URL || !WALLET_PRIVATE_KEY) {
      console.error("Missing env variables");
    }

    console.log(
      path.resolve(__dirname, "./../solidity/contracts/zk/members.wasm")
    );

    this.provider = new ethers.JsonRpcProvider(INFURA_URL);
    this.signer = new ethers.Wallet(WALLET_PRIVATE_KEY, this.provider);
    this.contract = new ethers.Contract(
      CONTRACT_ADDRESS,
      DeployModule.abi,
      this.signer
    );
  }

  async verifyAndMint(recipient: string, input: any): Promise<any> {
    const tokenURI = "https://example.it";
    const data = await this.calculateSolidityCalldata(input);
    return this.contract.verifyAndMint(recipient, tokenURI, data);
  }

  private async getProofAndPublicSignals(input: CircuitSignals) {
    const wasmFile = path.resolve(
      __dirname,
      "./../solidity/contracts/zk/members.wasm"
    );
    // relative to the root of the project

    const zkeyFileName = path.resolve(
      __dirname,
      "/solidity/contracts/zk/circuit.zkey"
    );
    const { proof, publicSignals } = await plonk.fullProve(
      input, // what are the inputs ??
      wasmFile,
      zkeyFileName,
      console.log
    );

    return { proof, publicSignals };
  }

  async calculateSolidityCalldata(input: any) {
    const { proof, publicSignals } = await this.getProofAndPublicSignals(input);
    const calldata = await plonk.exportSolidityCallData(proof, publicSignals);

    console.log("proof calldata:" + calldata);

    return calldata;
  }
}
