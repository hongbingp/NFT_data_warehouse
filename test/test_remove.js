const CytoWave721 = artifacts.require("CytoWave721");

contract("CytoWave721", (accounts) => {
  const creator = accounts[0];

  it("should remove an NFT from sale", async () => {
    const cytoWave721 = await CytoWave721.deployed();

    // Create a new NFT with the user account
    await cytoWave721.createToken("Test Art", "Test Description", "2023-05-01", "Test Artist", 100, "Test Image", { from: creator });

    const tokenId = 0;

    // List the NFT for sale using the listNFTForSale function with a sale price
    await cytoWave721.resellArt(tokenId, 200, { from: creator });

    // Get the updated art information
    let updatedArt = await cytoWave721.findArt(tokenId);
    assert.equal(updatedArt.status.toNumber(), 1, "NFT should be listed for sale");

    // Remove the NFT from sale using the removeNFTFromSale function
    await cytoWave721.resellArt(tokenId, 0, { from: creator });

    // Assert that the NFT is no longer listed for sale
    let art = await cytoWave721.findArt(tokenId);

      // Add console.log statements to debug the issue
  console.log("Updated art status (after listing for sale):", updatedArt.status.toNumber());
  console.log("Art status (after removing from sale):", art.status.toNumber());
  
    assert.equal(art.status.toNumber(), 0, "NFT should no longer be listed for sale");
  });
});
