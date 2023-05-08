const CytoWave721 = artifacts.require("CytoWave721");

contract("CytoWave721", accounts => {
    let cytoWave721;
    const [alice] = accounts;

    beforeEach(async () => {
        cytoWave721 = await CytoWave721.new("CytoWave721", "CW721");
        await cytoWave721.createToken("Title", "Description", "Date", "Author", 100, "Image", {from: alice});
    });

    it("should list an NFT for sale", async () => {
        const tokenId = 0;
        const salePrice = 200;

        await cytoWave721.resellArt(tokenId, salePrice, {from: alice});

        // Assuming you have a function to get the art by its tokenId
        const art = await cytoWave721.findArt(tokenId);
        // assert.equal(art.status, 1, "NFT status should be 1 (listed for sale)");
        // assert.equal(art.price, salePrice, "NFT sale price should match the input value");
        assert.equal(art[4], 1, "NFT status should be 1 (listed for sale)");
        assert.equal(art[3], salePrice, "NFT sale price should match the input value");
    });
});
