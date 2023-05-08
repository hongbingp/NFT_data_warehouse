const CytoWave1155 = artifacts.require("CytoWave1155");

module.exports = function (deployer) {
  deployer.deploy(CytoWave1155, "https://example.com/token/");
};
