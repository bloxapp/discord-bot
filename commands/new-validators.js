const validatorsApi = require('../api/validators');
const msgHeader = require('../helpers/msg-header');

const createEmbedMessage = async (network, validators) => {
  return {
    ...msgHeader,
    title: `New ${network} active validators on ${process.env.ENV}`,
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

const loadNewValidators = async (network, periodInMin = 60) => {
  const validators = await validatorsApi.loadNewValidators(network, periodInMin);
  if (validators.length === 0) {
    return;
  }
  const outputString = createEmbedMessage(network, validators);
  return outputString;
};

module.exports = loadNewValidators;