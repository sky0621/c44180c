import { ethers } from "ethers";
import {
  ContractInfo,
  getContractInfo,
  getMintInfo,
  getNetworkInfo,
  getOwnerInfo,
  MintInfo,
  NetworkInfo,
  OwnerInfo,
} from "./util";
import skyTokenArtifacts from "../artifacts/contracts/skyt.sol/SkyTokenOLD.json";

const main = async () => {
  const networkInfo: NetworkInfo = getNetworkInfo();
  console.table(networkInfo);

  const ownerInfo: OwnerInfo = getOwnerInfo();
  console.table(ownerInfo);

  const mintInfo: MintInfo = getMintInfo();
  console.table(mintInfo);

  const contractInfo: ContractInfo = getContractInfo();
  console.table(contractInfo);

  const provider = new ethers.JsonRpcProvider(networkInfo.rpcProviderUrl);
  console.info("got provider");

  const wallet = new ethers.Wallet(ownerInfo.privateKey, provider);
  console.info("got wallet");

  const contract = new ethers.Contract(
    contractInfo.address,
    skyTokenArtifacts.abi,
    wallet,
  );
  console.info("got contract");

  const decimals: bigint = await contract.decimals();
  console.info("decimals: ", decimals);

  const rawAmount: bigint = BigInt(
    ethers.parseUnits(String(mintInfo.amount), decimals),
  );
  console.info("rawAmount: ", rawAmount);

  const tx = await contract.mint(mintInfo.toAddress, rawAmount);
  console.info(`Transaction URL: ${networkInfo.transactionUrlBase}${tx.hash}`);

  const receipt = await tx.wait();
  for (let log of receipt.logs) {
    try {
      const event = contract.interface.parseLog(log);
      if (!event) {
        console.error("event is none");
        continue;
      }
      console.info("Event");
      console.table({ name: event.name, args: event.args });
    } catch (e) {
      console.error(e);
    }
  }
};

main().catch((e) => {
  console.error(e);
});
