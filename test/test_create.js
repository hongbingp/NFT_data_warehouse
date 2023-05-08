const CytoWave721 = artifacts.require("CytoWave721");

contract("CytoWave721", (accounts) => {
  let cytoWave721;
  const owner = accounts[0];

  beforeEach(async () => {
    cytoWave721 = await CytoWave721.new("CytoWave721", "CW721");
  });

  it('should create a new NFT with correct properties', async function () {
    const tokenURI = "https://mytoken.com/token/1";
    await cytoWave721.createToken("test title", "test description", "test date", "test author", 10, tokenURI, {from: accounts[0]});

    // Get the tokenId of the newly created token
    const tokenId = (await cytoWave721.getArtCount()).toNumber();

    // Make sure the token exists
    assert.notEqual(await cytoWave721.ownerOf(tokenId), '0x0000000000000000000000000000000000000000');

    // Check the properties of the newly created token
    const result = await cytoWave721.findArt(tokenId);
    const id = result[0].toNumber();
    const title = result[1];
    const description = result[2];
    const price = result[3].toNumber();
    const status = result[4].toNumber();
    const date = result[5];
    const authorName = result[6];
    const author = result[7];
    const owner = result[8];
    const image = result[9];

    assert.equal(id, tokenId);
    assert.equal(title, "test title");
    assert.equal(description, "test description");
    assert.equal(price, 10);
    assert.equal(date, "test date");
    assert.equal(authorName, "test author");
    assert.equal(image, tokenURI);
    assert.equal(author, accounts[0]);
    assert.equal(owner, accounts[0]);
});

});
