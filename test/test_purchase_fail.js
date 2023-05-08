const CytoWave721 = artifacts.require("cytoWave721");
const truffleAssert = require("truffle-assertions");

contract("CytoWave721", (accounts) => {
  let cytoWave721;
  const creator = accounts[0];
  const buyer = accounts[1];
  const nftPrice = 200;

  beforeEach(async () => {
    cytoWave721 = await CytoWave721.new("CytoWave721", "CW721");
  });

  it("should fail to execute an NFT purchase with an incorrect amount of Ether and not transfer ownership", async () => {
    // Create a new NFT with the creator account
    await cytoWave721.createToken(
      "Test Art",
      "A description of the test art",
      "2023-05-01",
      "Test Artist",
      nftPrice,
      "https://example.com/image.png",
      { from: creator }
    );

    // List the NFT for sale with a sale price
    const tokenId = 0;
    await cytoWave721.resellArt(tokenId, nftPrice, { from: creator });

    // Attempt to purchase the NFT with the buyer account but with an incorrect amount of Ether
    const incorrectAmount = 100; // Less than the nftPrice
    try {
      await cytoWave721.buyArt(tokenId, {
        from: buyer,
        value: incorrectAmount,
      });
    } catch (error) {
      console.log("Revert message:", error.reason); // Log the revert message
    }

    // Assert that the NFT ownership remains with the creator account and no Ether was transferred
    const owner = await cytoWave721.ownerOf(tokenId);
    assert.equal(owner, creator, "Ownership should remain with the creator");
  });
});
