import axios, { AxiosInstance, AxiosResponse } from 'axios';

interface Response<T> {
    FromEpoch: number;
    ToEpoch: number;
    Data: T;
}

interface DutyStat {
    Assigned: number;
    Executed: number;
}

interface Stats {
    Proposals: DutyStat;
    Attestations: DutyStat;
    AttestationRate: number;
    Effectiveness: number;
}

interface ValidatorStats {
    [validatorIndex: string]: Stats
};

class E2M {
    private clients: { [network: string]: AxiosInstance } = {
        mainnet: this.createClientForNetwork('mainnet'),
        prater: this.createClientForNetwork('prater'),
    };

    private createClientForNetwork(network) {
        return axios.create({
            baseURL: network === 'prater'
                ? process.env.E2M_PRATER_URL
                : process.env.E2M_MAINNET_URL,
        });
    }

    private async request(network: string, path: string, params: any): Promise<AxiosResponse<any>> {
        const resp = await this.clients[network].get(path, {
            params,
        });
        if (resp.status !== 200) {
            throw new Error(`E2M API error: status ${resp.status}, message: ${resp.data}`);
        }
        return resp;
    }

    public async getCumulativeStats(network: string, latest: number): Promise<Response<Stats>> {
        const resp = await this.request(network, '/api/stats/', { latest, minus: 1 });
        return resp.data;
    };

    public async getValidatorStats(network: string, latest: number): Promise<Response<ValidatorStats>> {
        const resp = await this.request(network, '/api/stats/validators', { latest, minus: 1 });
        return resp.data;
    };
}

export default new E2M();
