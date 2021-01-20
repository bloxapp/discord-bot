const validatorsApi = require('../api/validators');
const organizationsApi = require('../api/organizations');
const msgHeader = require('../helpers/msg-header');

const loadValidatorsData = async () => {
  const wallets = await validatorsApi.loadWallets();
  const validators = await validatorsApi.loadValidators();
  return { wallets, validators };
};

const loadUsersData = async () => {
  const users = await organizationsApi.loadStats();
  return users;
};

const createEmbedMessage = async (data, ) => {
  const { wallets, validators, users } = data;
  let validatorsCount = 0;
  const validatorsKeys = ['active', 'deposited'];
  const { pyrmont, mainnet } = validators;
  for (const [key, value] of Object.entries(validators)) {
    if(validatorsKeys.includes(key)) {
      validatorsCount+= value;
    }    
  }
  return {
    ...msgHeader,
    title: `Statistics ${process.env.ENV}`,
    fields: [
      {
        name: 'Users',
        value: users.total,
      },
      {
        name: 'Wallets',
        value: '-------------------------'
      },
      ...Object.keys(wallets).reduce((aggr, key) => {
        const name = key === 'deprecated_version'
          ? 'Deprecated'
          : `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        aggr.push({
          name,
          value: wallets[key],
          inline: true
        });
        return aggr;
      }, [{ name: 'Total', value: Object.values(wallets).reduce((a, b) => a + b, 0), inline: true }]),
      {
        name: 'Pyrmont Validators',
        value: '-------------------------'
      },
      ...Object.keys(pyrmont).reduce((aggr, key) => {
        const name = key === 'unknown_status'
          ? 'Unknown'
          : `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        aggr.push({
          name,
          value: pyrmont[key],
          inline: true
        });
        return aggr;
      }, []),
      {
        name: 'Mainnet Validators',
        value: '-------------------------'
      },
      ...Object.keys(mainnet).reduce((aggr, key) => {
        const name = key === 'unknown_status'
          ? 'Unknown'
          : `${key.charAt(0).toUpperCase()}${key.slice(1)}`;
        aggr.push({
          name,
          value: mainnet[key],
          inline: true
        });
        return aggr;
      }, []),
    ],
  };
};

const loadProcessStatistics = async () => {
  const validators = await loadValidatorsData();
  const users = await loadUsersData();
  const outputString = await createEmbedMessage({ ...validators, users });
  return outputString;
};

module.exports = loadProcessStatistics;