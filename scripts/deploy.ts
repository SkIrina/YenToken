import { ethers } from "hardhat";

async function main() {
  const Token = await ethers.getContractFactory("Token");
  const token = await Token.deploy(1000000);

  await token.deployed();

  console.log("My token deployed to:", token.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
