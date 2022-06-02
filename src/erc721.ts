import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts";
import { Transfer as TransferEvent, Token } from "../generated/Token/Token";
import { Detris, Asset, Transfer } from "../generated/schema";

import { createAccount } from "./lib/account";
import {
  ADDRESS_ZERO,
  getAsset,
  fetchBalance,
  logTransaction
} from "./lib/asset";

export function handleTransfer(event: TransferEvent): void {
  let from = createAccount(event.params.from, event.block.timestamp);
  let to = createAccount(event.params.to, event.block.timestamp);
  let tokenId = event.params.tokenId;
  let contractAddress = event.address;
  let value = BigInt.fromI32(1);

  let asset: Asset = getAsset(contractAddress, tokenId, event.params.to);
  let detris = Detris.load(contractAddress.toHex());

  if (detris == null) {
    let contract = Token.bind(
      Address.fromString(contractAddress.toHexString())
    );
    let tokenProxy = event.address;
    let name = "Detris";
    let symbol = "DTRS";
    let mintPrice = BigInt.fromI32(0);
    let maxSupply = BigInt.fromI32(101);

    detris = new Detris(contractAddress.toHex());

    detris.address = tokenProxy;
    detris.name = name;
    detris.symbol = symbol;
    detris.mintPrice = mintPrice;
    detris.maxSupply = maxSupply;
    detris.currentSupply = BigInt.fromI32(0);
    detris.createdAt = event.block.timestamp;
    detris.updatedAt = event.block.timestamp;

    detris.save();
  }

  let transfer = new Transfer(
    event.block.number
      .toString()
      .concat("-")
      .concat(event.logIndex.toString())
  );

  transfer.transaction = logTransaction(event).id;
  transfer.timestamp = event.block.timestamp;
  transfer.asset = asset.id;
  transfer.from = from.id;
  transfer.to = to.id;
  transfer.value = value;
  transfer.type = "transfer";

  transfer.save();

  if (from.id == ADDRESS_ZERO) {
    detris.currentSupply = detris.currentSupply.plus(BigInt.fromI32(1));
  } else {
    let balance = fetchBalance(asset, from);

    balance.value = balance.value.minus(value);
    balance.save();
    transfer.fromBalance = balance.id;
  }

  if (to.id == ADDRESS_ZERO) {
    detris.currentSupply = detris.currentSupply.minus(BigInt.fromI32(1));
  } else {
    let balance = fetchBalance(asset, to);

    balance.value = balance.value.plus(value);
    balance.save();

    transfer.toBalance = balance.id;
  }

  detris.save();
  transfer.save();
  asset.save();
}
