import dotenv from 'dotenv';
import pinataSDK from '@pinata/sdk';
import { ethers } from 'ethers';

dotenv.config();

let pinataApiKey: string = '';
let pinataSecretApiKey: string = '';
let rpcBaseAddress: string = '';
let privateKey: string = '';

function init(): void {
  pinataApiKey = process.env.PINATA_API_KEY!;
  pinataSecretApiKey = process.env.PINATA_SECRET_API_KEY!;
  rpcBaseAddress = process.env.OTHENTIC_CLIENT_RPC_ADDRESS!;
  privateKey = process.env.PRIVATE_KEY!;
  console.log(`pinataApiKey: ${pinataApiKey}`);
  console.log(`pinataSecretApiKey: ${pinataSecretApiKey}`);
  console.log(`rpcBaseAddress: ${rpcBaseAddress}`);
  console.log(`privateKey: ${privateKey}`);
}

async function sendTask(proofOfTask: string, data: string, taskDefinitionId: number): Promise<void> {
  const wallet = new ethers.Wallet(privateKey);
  const performerAddress = wallet.address;

  data = ethers.hexlify(ethers.toUtf8Bytes(data));
  const message = ethers.AbiCoder.defaultAbiCoder().encode(
    ["string", "bytes", "address", "uint16"],
    [proofOfTask, data, performerAddress, taskDefinitionId]
  );
  const messageHash = ethers.keccak256(message);
  const sig = wallet.signingKey.sign(messageHash).serialized;

  const jsonRpcBody = {
    jsonrpc: "2.0",
    method: "sendTask",
    params: [
      proofOfTask,
      data,
      taskDefinitionId,
      performerAddress,
      sig,
    ]
  };

  try {
    const provider = new ethers.JsonRpcProvider(rpcBaseAddress);
    const response = await provider.send(jsonRpcBody.method, jsonRpcBody.params);
    console.log("API response:", response);
  } catch (error) {
    console.error("Error making API request:", error);
  }
}

async function publishJSONToIpfs(data: any): Promise<string> {
  let proofOfTask: string = '';
  try {
    const pinata = new pinataSDK(pinataApiKey, pinataSecretApiKey);
    const response = await pinata.pinJSONToIPFS(data);
    proofOfTask = response.IpfsHash;
    console.log(`proofOfTask: ${proofOfTask}`);
  } catch (error) {
    console.error("Error making API request to pinataSDK:", error);
  }
  return proofOfTask;
}

export {
  init,
  publishJSONToIpfs,
  sendTask
}
