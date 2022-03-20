import { task } from "hardhat/config";

const contractAddress = "0x1c89A807bBc003A17F7F3c695F57B684Baba24db";

task("transfer", "--CUSTOM-- Transfer YEN from sender balance to other address")
  .addParam("receiver", "Receiver address")
  .addParam("amount", "YEN amount")
  .setAction(async function ({ receiver, amount }, { ethers }) {
    const Token = await ethers.getContractAt("Token", contractAddress);
    const [sender] = await ethers.getSigners();
    await Token.connect(sender).transfer(receiver, amount);
    console.log(`The sender transferred ${amount} YEN to ${receiver}`);
  });

task(
  "transferFrom",
  "--CUSTOM-- Transfer YEN from one address balance to other"
)
  .addParam("from", "From address")
  .addParam("to", "To address")
  .addParam("amount", "YEN amount")
  .setAction(async function ({ from, to, amount }, { ethers }) {
    const Token = await ethers.getContractAt("Token", contractAddress);
    const [sender] = await ethers.getSigners();
    await Token.transferFrom(from, to, amount);
    console.log(
      `The address ${sender.address} transferred ${amount} YEN from ${from} to ${to}`
    );
  });

task(
  "approve",
  "--CUSTOM-- Allow another address to withdraw from your balance"
)
  .addParam("spender", "Spender address")
  .addParam("amount", "YEN amount")
  .setAction(async function ({ spender, amount }, { ethers }) {
    const Token = await ethers.getContractAt("Token", contractAddress);
    const [sender] = await ethers.getSigners();
    await Token.connect(sender).approve(spender, amount);
    console.log(
      `The sender ${sender.address} approved ${amount} YEN allowance to ${spender}`
    );
  });
