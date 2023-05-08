const CytoWave721 = artifacts.require("CytoWave721");

module.exports = function (deployer) {
  deployer.deploy(CytoWave721, "CytoWave721", "CW721");
};
