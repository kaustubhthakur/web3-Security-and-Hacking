const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { parseEther } = require("ethers/lib/utils");
const { ethers } = require("hardhat");

describe("Attack", function () {
  it("Should empty the balance of the good contract", async function () {

    const goodContractFactory = await ethers.getContractFactory("GoodContract");
    const goodContract = await goodContractFactory.deploy();
    await goodContract.deployed();

    
    const badContractFactory = await ethers.getContractFactory("BadContract");
    const badContract = await badContractFactory.deploy(goodContract.address);
    await badContract.deployed();

    
    const [_, innocentAddress, attackerAddress] = await ethers.getSigners();

    let tx = await goodContract.connect(innocentAddress).addBalance({
      value: parseEther("10"),
    });
    await tx.wait();

    
    let balanceETH = await ethers.provider.getBalance(goodContract.address);
    expect(balanceETH).to.equal(parseEther("10"));

   
    tx = await badContract.connect(attackerAddress).attack({
      value: parseEther("1"),
    });
    await tx.wait();

  
    balanceETH = await ethers.provider.getBalance(goodContract.address);
    expect(balanceETH).to.equal(BigNumber.from("0"));

    
    balanceETH = await ethers.provider.getBalance(badContract.address);
    expect(balanceETH).to.equal(parseEther("11"));
  });
});