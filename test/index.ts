import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { expect } from "chai";
import { ethers } from "hardhat";
import { Token, Token__factory } from "../typechain";

describe("My awesome yena token contract", function () {
  let Token: Token__factory;
  let token: Token;
  let owner: SignerWithAddress;
  let addr1: SignerWithAddress;
  let addr2: SignerWithAddress;
  let addrs: SignerWithAddress[];
  const totalSupply = 1000000;

  beforeEach(async function () {
    Token = await ethers.getContractFactory("Token");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();

    token = await Token.deploy(totalSupply);
  });

  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await token.owner()).to.equal(owner.address);
    });

    it("Should set the name of the token to Yena token", async function () {
      expect(await token.name()).to.equal("Yena Token");
    });

    it("Should set the symbol of the token to YEN", async function () {
      expect(await token.symbol()).to.equal("YEN");
    });

    it("Should set the decimals of the token to 18", async function () {
      expect(await token.decimals()).to.equal(18);
    });

    it(`Should set the total supply of tokens to ${totalSupply}`, async function () {
      expect(await token.totalSupply()).to.equal(totalSupply);
    });

    it(`Should set initial owner balance to ${totalSupply}`, async function () {
      expect(await token.balanceOf(owner.address)).to.equal(totalSupply);
    });
  });

  describe("Transfer", function () {
    it("Should transfer tokens from one address to another address", async function () {
      await token.transfer(addr1.address, 10);

      expect(await token.balanceOf(owner.address)).to.equal(totalSupply - 10);
      expect(await token.balanceOf(addr1.address)).to.equal(10);
    });

    it("Should emit transfer event", async function () {
      await expect(token.transfer(addr1.address, 10))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, addr1.address, 10);
    });

    it("Should not allow to transfer more than the account has", async function () {
      await token.transfer(addr1.address, 10);

      await expect(
        token.connect(addr1).transfer(addr2.address, 50)
      ).to.be.revertedWith("Not enough balance for transfer");
    });
  });

  describe("Allowance and approve", function () {
    it("Should set correct allowance", async function () {
      // arrd1 allows addr2 to spend 10 YEN
      await token.connect(addr1).approve(addr2.address, 10);

      expect(await token.allowance(addr1.address, addr2.address)).to.equal(10);
    });

    it("Should emit approve event", async function () {
      await expect(token.connect(addr1).approve(addr2.address, 10))
        .to.emit(token, "Approval")
        .withArgs(addr1.address, addr2.address, 10);
    });
  });

  describe("TransferFrom", function () {
    it("Should set correct balances and allowance", async function () {
      // owner gives addr1 20 YEN
      await token.transfer(addr1.address, 20);

      // arrd1 allows addr2 to spend 10 YEN
      await token.connect(addr1).approve(addr2.address, 10);

      // act: addr2 transfers 5 YEN from addr1
      await token.connect(addrs[0]).transferFrom(addr1.address, addr2.address, 5);

      expect(await token.allowance(addr1.address, addr2.address)).to.equal(5);
      expect(await token.balanceOf(addr1.address)).to.equal(15);
      expect(await token.balanceOf(addr2.address)).to.equal(5);
    });

    it("Should not allow to transfer more than the account has", async function () {
      // owner gives addr1 20 YEN
      await token.transfer(addr1.address, 20);

      // arrd1 allows addr2 to spend 50 YEN
      await token.connect(addr1).approve(addr2.address, 50);

      // act: addr2 transfers 50 YEN from addr1
      await expect(
        token.connect(addrs[0]).transferFrom(addr1.address, addr2.address, 50)
      ).to.be.revertedWith("This transfer is not permitted");
    });

    it("Should not allow to transfer without allowance", async function () {
      // owner gives addr1 20 YEN
      await token.transfer(addr1.address, 20);

      // act: addr2 transfers 20 YEN from addr1
      await expect(
        token.connect(addrs[0]).transferFrom(addr1.address, addr2.address, 20)
      ).to.be.revertedWith("This transfer is not permitted");
    });

    it("Should emit transfer event", async function () {
      await token.approve(addr1.address, 10);

      await expect(token.connect(addrs[0]).transferFrom(owner.address, addr1.address, 10))
        .to.emit(token, "Transfer")
        .withArgs(owner.address, addr1.address, 10);
    });
  });

  describe("Mint", function () {
    it("Should set correct balances and total supply", async function () {
      // owner mints for addr1 10 YEN
      await token.mint(addr1.address, 10);

      expect(await token.balanceOf(addr1.address)).to.equal(10);
      expect(await token.totalSupply()).to.equal(totalSupply + 10);
    });

    it("Should not allow non-owner to mint", async function () {
      await expect(
        token.connect(addr1).mint(addr1.address, 10)
      ).to.be.revertedWith("Minting not allowed");
    });

    it("Should emit transfer event", async function () {
      await expect(token.mint(addr1.address, 10))
        .to.emit(token, "Transfer")
        .withArgs(ethers.constants.AddressZero, addr1.address, 10);
    });
  });

  describe("Burn", function () {
    it("Should set correct balances and total supply", async function () {
      // owner gives addr1 20 YEN
      await token.transfer(addr1.address, 20);

      // owner burns from addr1 10 YEN
      await token.burn(addr1.address, 10);

      expect(await token.balanceOf(addr1.address)).to.equal(10);
      expect(await token.totalSupply()).to.equal(totalSupply - 10);
    });

    it("Should not allow non-owner to burn", async function () {
      await expect(
        token.connect(addr1).burn(addr1.address, 10)
      ).to.be.revertedWith("Burning not allowed");
    });

    it("Should not allow owner to burn more than account has", async function () {
      // owner gives addr1 20 YEN
      await token.transfer(addr1.address, 20);

      await expect(token.burn(addr1.address, 30)).to.be.revertedWith(
        "Not possible to burn this amount"
      );
    });

    it("Should emit transfer event", async function () {
      // owner gives addr1 20 YEN
      await token.transfer(addr1.address, 20);

      await expect(token.burn(addr1.address, 10))
        .to.emit(token, "Transfer")
        .withArgs(addr1.address, ethers.constants.AddressZero, 10);
    });
  });
});
