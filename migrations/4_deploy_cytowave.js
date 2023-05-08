const CytoWave = artifacts.require("CytoWave");
const CytoWave721 = artifacts.require("CytoWave721");
const CytoWave1155 = artifacts.require("CytoWave1155");

module.exports = async function (deployer) {
  const cytoWave721 = await CytoWave721.deployed();
  const cytoWave1155 = await CytoWave1155.deployed();

  await deployer.deploy(CytoWave, cytoWave721.address, cytoWave1155.address);
};
