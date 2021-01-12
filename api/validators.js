const axios = require('axios');

const validatorsApi = () => {
  const loadWallets = async () => {
    const url = `${process.env.VC_URL}/monitor/wallets_states`;
    const wallets = await axios(url);
    return wallets.data.result;
  }
  
  const loadValidators = async () => {
    const url = `${process.env.VC_URL}/monitor/accounts_states`;
    const validators = await axios(url);
    return validators.data.result;
  }

  const loadNewValidators = async (network) => {
    const url = `${process.env.VC_URL}/accounts/?activation={"minutes":30}&network=${network}`;
    const validators = await axios(url);
    return validators.data.slice(0, 10);
  };

  return {
    loadWallets,
    loadValidators,
    loadNewValidators
  };
};

module.exports = validatorsApi();