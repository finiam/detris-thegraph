import { BigInt, Bytes, ethereum, Address } from "@graphprotocol/graph-ts";
import { Asset, Balance, Transaction, Account } from "../../generated/schema";

import { Token as TokenContract } from "../../generated/templates/Token/Token";

export const ADDRESS_ZERO = "0x0000000000000000000000000000000000000000";

let THOUNSAND = BigInt.fromI32(1000);

export function getAssetId(contractAddress: string, assetId: BigInt): string {
  return contractAddress + "-" + assetId.toString();
}

export function getAsset(
  contractAddress: Bytes,
  tokenId: BigInt,
  to: Bytes
): Asset {
  let id = getAssetId(contractAddress.toHexString(), tokenId);
  let asset = Asset.load(id);

  let contract = TokenContract.bind(
    Address.fromString(contractAddress.toHexString())
  );

  if (asset == null) {
    asset = new Asset(id);
    asset.tokenId = tokenId;
    asset.contractAddress = contractAddress;
    asset.owner = to;
    asset.minter = to;
    asset.URI = contract.tokenURI(tokenId).replace("{id}", tokenId.toString());
    asset.organization = contractAddress.toHex();
  }

  return asset as Asset;
}

export function fetchBalance(asset: Asset, account: Account): Balance {
  let balanceid = asset.id.concat("-").concat(account.id);
  let balance = Balance.load(balanceid);

  if (balance == null) {
    balance = new Balance(balanceid);
    balance.asset = asset.id;
    balance.account = account.id;
    balance.value = BigInt.fromI32(0);
  }

  return balance as Balance;
}

export function logTransaction(event: ethereum.Event): Transaction {
  let tx = new Transaction(event.transaction.hash.toHex());

  tx.timestamp = event.block.timestamp;
  tx.blockNumber = event.block.number;
  tx.save();

  return tx as Transaction;
}
