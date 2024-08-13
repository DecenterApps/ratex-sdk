import Web3 from 'web3';
export declare function CreateUniswapV2HelperContract(chainId: number, web3: Web3): import("web3").Contract<{
    inputs: {
        components: ({
            internalType: string;
            name: string;
            type: string;
            components?: undefined;
        } | {
            components: {
                internalType: string;
                name: string;
                type: string;
            }[];
            internalType: string;
            name: string;
            type: string;
        })[];
        internalType: string;
        name: string;
        type: string;
    }[];
    name: string;
    outputs: {
        components: ({
            internalType: string;
            name: string;
            type: string;
            components?: undefined;
        } | {
            components: {
                internalType: string;
                name: string;
                type: string;
            }[];
            internalType: string;
            name: string;
            type: string;
        })[];
        internalType: string;
        name: string;
        type: string;
    }[];
    stateMutability: string;
    type: string;
}[]>;
