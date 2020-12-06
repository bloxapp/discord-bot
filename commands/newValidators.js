const validatorsApi = require('../api/validators');

const createEmbedMessage = async (isStage, network, validators) => {
  return {
    color: 0x32E0C4, 
    url: 'https://www.bloxstaking.com',
    title: `New ${network} active validators on ${isStage ? 'stage' : 'production'} `,
    thumbnail: {
      url: 'https://www.bloxstaking.com/wp-content/uploads/2020/04/Blox-Staking_logo_white.png',
    },
    fields: validators.map((validator) => {
      const { id, network } = validator;
      const currentNetwork = network === 'mainnet' ? '' : `${network}.`;
      const value = `https://${currentNetwork}beaconcha.in/validator/${validator.publicKey}`;
      return {
        name: `Validator id ${id}`,
        value
      }
    }),
  };
};

const loadNewValidators = async (isStage, network) => {
  const validators = await validatorsApi.loadNewValidators(isStage, network);
  const outputString = createEmbedMessage(isStage, network, validators);
  return outputString;
};

module.exports = loadNewValidators;