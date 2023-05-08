const CytoWave721 = artifacts.require("CytoWave721");

contract("CytoWave721", accounts => {
    let cytoWave721;
    const alice = accounts[1];
    const bob = accounts[2];
    
    beforeEach(async () => {
        cytoWave721 = await CytoWave721.new("CytoWave721", "CW721");
        await cytoWave721.createToken("Title", "Description", "Date", "Author", 100, "Image", {from: alice});
    });

    it("should transfer ownership of an NFT", async () => {
        const tokenId = 0;
        await cytoWave721.safeTransferFrom(alice, bob, tokenId, {from: alice});

        const newOwner = await cytoWave721.ownerOf(tokenId);
        assert.equal(newOwner, bob);
    });
});
