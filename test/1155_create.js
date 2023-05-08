const CytoWave1155 = artifacts.require("CytoWave1155");
const { expect } = require("chai");

contract("CytoWave1155", function (accounts) {
  const [owner, addr1] = accounts;
  let cytoWave1155;

  beforeEach(async () => {
    cytoWave1155 = await CytoWave1155.new("https://api.example.com/");
  });

  describe("createToken", function () {
    it("creates a new non-fungible NFT", async function () {
      // Arrange
      const title = "Example Art";
      const description = "An example NFT";
      const price = web3.utils.toWei("1", "ether");
      const date = "2023-05-04";
      const authorName = "Artist";
      const image = "https://example.com/image.jpg";
      const isFungible = false;
      const initialSupply = 1;

      // Act
      const tx = (await cytoWave1155.createToken(
        title,
        description,
        price,
        date,
        authorName,
        image,
        isFungible,
        initialSupply,
        { from: owner }
      ));
      const event = tx.logs.find(log => log.event === "LogArtTokenCreate");
      const tokenId = event.args.tokenId.toString();

      // Assert
      const art = await cytoWave1155.findArt(tokenId);
      expect(art[1]).to.equal(title);
      expect(art[2]).to.equal(description);
      expect(art[3].toString()).to.equal(price);
      expect(art[4]).to.equal(date);
      expect(art[5]).to.equal(authorName);
      expect(art[6]).to.equal(owner);
      expect(art[7]).to.equal(image);
    });
  });

  describe("createToken with initialSupply greater than 1", function () {
    it("creates a new NFT with the provided initial supply", async function () {
      // Arrange
      const title = "Example Art";
      const description = "An example NFT";
      const price = web3.utils.toWei("1", "ether");
      const date = "2023-05-04";
      const authorName = "Artist";
      const image = "https://example.com/image.jpg";
      const isFungible = true;
      const initialSupply = 5;

      // Act
      const tx = (await cytoWave1155.createToken(
        title,
        description,
        price,
        date,
        authorName,
        image,
        isFungible,
        initialSupply,
        { from: owner }
      ));
      const event = tx.logs.find(log => log.event === "LogArtTokenCreate");
      const tokenId = event.args.tokenId.toString();
      // Assert
      const art = await cytoWave1155.findArt(tokenId);
      expect(art[1]).to.equal(title);
      expect(art[2]).to.equal(description);
      expect(art[3].toString()).to.equal(price);
      expect(art[4]).to.equal(date);
      expect(art[5]).to.equal(authorName);
      expect(art[6]).to.equal(owner);
      expect(art[7]).to.equal(image);

      // Check the initial supply
      const balance = await cytoWave1155.balanceOf(owner, tokenId);
      expect(balance.toString()).to.equal(initialSupply.toString());
    });
  });

});
