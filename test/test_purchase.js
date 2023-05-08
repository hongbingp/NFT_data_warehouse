const CytoWave721 = artifacts.require("CytoWave721");

contract("CytoWave721", accounts => {
  it("should execute a successful NFT purchase", async () => {
    const cytoWave721 = await CytoWave721.deployed();

    const seller = accounts[4];
    const buyer = accounts[5];
    const title = "Test Art";
    const description = "Test Description";
    const date = "2023-05-01";
    const authorName = "Test Artist";
    const price = 100;
    const image = "Test_Image_URL";

    await cytoWave721.createToken(title, description, date, authorName, price, image, {from: seller});
    const tokenId = (await cytoWave721.getArtCount()).toNumber();

    // List the NFT for sale with a sale price
    const salePrice = web3.utils.toWei('0.1', 'ether');
    await cytoWave721.resellArt(tokenId, salePrice, {from: seller});
    const updatedArt = await cytoWave721.arts(tokenId);

    // Get initial balances
    const sellerInitialBalance = await web3.eth.getBalance(seller);
    const buyerInitialBalance = await web3.eth.getBalance(buyer);

    // Purchase the NFT with the correct amount of Ether
    await cytoWave721.buyArt(tokenId, {from: buyer, value: salePrice});

    // Assert that the NFT is now owned by the second user account
    const newOwner = await cytoWave721.ownerOf(tokenId);
    assert.equal(newOwner, buyer, "NFT should be owned by the second user account");

    // Assert that the correct amount of Ether was transferred to the first user account
    const sellerNewBalance = await web3.eth.getBalance(seller);
    const buyerNewBalance = await web3.eth.getBalance(buyer);
    const sellerBalanceDiff = web3.utils.fromWei(new web3.utils.BN(sellerNewBalance).sub(new web3.utils.BN(sellerInitialBalance)), 'ether');
    const buyerBalanceDiff = web3.utils.fromWei(new web3.utils.BN(buyerInitialBalance).sub(new web3.utils.BN(buyerNewBalance)), 'ether');

    assert.approximately(parseFloat(sellerBalanceDiff), parseFloat(web3.utils.fromWei(salePrice, 'ether')), 0.1, "Seller should receive the correct amount of Ether");
    assert.approximately(parseFloat(buyerBalanceDiff), parseFloat(web3.utils.fromWei(salePrice, 'ether')), 0.1, "Buyer should pay the correct amount of Ether");
  });
});
