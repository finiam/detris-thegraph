import { Address, BigInt } from "@graphprotocol/graph-ts";
import { Account } from "../../generated/schema";

export function createAccount(id: Address, timestamp: BigInt): Account {
  let account = Account.load(id.toHex());

  if (account == null) {
    account = new Account(id.toHex());
    account.address = id;
    account.timestamp = timestamp;
    account.save();
  }

  return account as Account;
}
