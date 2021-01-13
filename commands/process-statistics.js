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
  for (const [key, value] of Object.entries(validators)) {
    if(validatorsKeys.includes(key)) {
      validatorsCount+= value;
    }    
  }
  return {
    ...msgHeader,
    title: `Users update statistics ${process.env.ENV}`,
    fields: [
      {
        name: 'Total registered users',
        value: users.total,
      },
      {
        name: 'Total wallets',
        value: wallets.active + wallets.disabled + wallets.offline,
      },
      {
        name: 'Active wallets',
        value: wallets.active,
      },
      {
        name: 'Offline wallets',
        value: wallets.offline,
      },
      {
        name: 'Total validators',
        value: validatorsCount,
      },                  
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