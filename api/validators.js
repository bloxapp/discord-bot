const axios = require('axios');

const api = () => {
  const loadWallets = async (isStage) => {
    const url = isStage ? `${process.env.VC_STAGE_URL}/wallets_states` : `${process.env.VC_URL}/wallets_states`;
    const wallets = await axios(url);
    return wallets.data.result;
  }
  
  const loadValidators = async (isStage) => {
    const url = isStage ? `${process.env.VC_STAGE_URL}/accounts_states` : `${process.env.VC_URL}/accounts_states`;
    const validators = await axios(url);
    return validators.data.result;
  }
  
  return {
    loadWallets,
    loadValidators
  };
};

module.exports = api();