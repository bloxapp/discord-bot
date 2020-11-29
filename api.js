const axios = require('axios');

const api = () => {
  const getWallets = async () => {
    const wallets = await axios(process.env.WALLETS_ROUTE);
    return wallets.data.result;
  }
  
  const getValidators = async () => {
    const validators = await axios(process.env.VALIDATORS_ROUTE);
    return validators.data.result;
  }
  return {
    getWallets,
    getValidators
  };
};

module.exports = api();