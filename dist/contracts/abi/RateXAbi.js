"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RateXAbi = void 0;
exports.RateXAbi = [
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "uint32",
                        name: "dexId",
                        type: "uint32",
                    },
                    {
                        internalType: "address",
                        name: "dexAddress",
                        type: "address",
                    },
                ],
                internalType: "struct RateX.DexType[]",
                name: "_initialDexes",
                type: "tuple[]",
            },
        ],
        stateMutability: "nonpayable",
        type: "constructor",
    },
    {
        inputs: [],
        name: "RateX__AmountInDoesNotMatch",
        type: "error",
    },
    {
        inputs: [],
        name: "RateX__AmountLesserThanMinAmount",
        type: "error",
    },
    {
        inputs: [],
        name: "RateX__AmountOutDoesNotMatch",
        type: "error",
    },
    {
        inputs: [],
        name: "RateX__DelegateCallFailed",
        type: "error",
    },
    {
        inputs: [],
        name: "RateX__DexAlreadyExists",
        type: "error",
    },
    {
        inputs: [],
        name: "RateX__DexDoesNotExist",
        type: "error",
    },
    {
        inputs: [],
        name: "RateX__NoRoutes",
        type: "error",
    },
    {
        inputs: [],
        name: "RateX__NotPaused",
        type: "error",
    },
    {
        inputs: [],
        name: "RateX__Paused",
        type: "error",
    },
    {
        inputs: [],
        name: "RateX__ReentrantCall",
        type: "error",
    },
    {
        inputs: [],
        name: "RateX__ZeroAddress",
        type: "error",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint32",
                name: "dexId",
                type: "uint32",
            },
            {
                indexed: false,
                internalType: "address",
                name: "dexAddress",
                type: "address",
            },
        ],
        name: "DexAdded",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint32",
                name: "dexId",
                type: "uint32",
            },
        ],
        name: "DexRemoved",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "uint32",
                name: "dexId",
                type: "uint32",
            },
            {
                indexed: false,
                internalType: "address",
                name: "oldAddress",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "newAddress",
                type: "address",
            },
        ],
        name: "DexReplaced",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "previousOwner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnershipTransferStarted",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: true,
                internalType: "address",
                name: "previousOwner",
                type: "address",
            },
            {
                indexed: true,
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "OwnershipTransferred",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [],
        name: "Paused",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [
            {
                indexed: false,
                internalType: "address",
                name: "tokenIn",
                type: "address",
            },
            {
                indexed: false,
                internalType: "address",
                name: "tokenOut",
                type: "address",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amountIn",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "uint256",
                name: "amountOut",
                type: "uint256",
            },
            {
                indexed: false,
                internalType: "address",
                name: "recipient",
                type: "address",
            },
        ],
        name: "SwapEvent",
        type: "event",
    },
    {
        anonymous: false,
        inputs: [],
        name: "Unpaused",
        type: "event",
    },
    {
        inputs: [],
        name: "acceptOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "uint32",
                        name: "dexId",
                        type: "uint32",
                    },
                    {
                        internalType: "address",
                        name: "dexAddress",
                        type: "address",
                    },
                ],
                internalType: "struct RateX.DexType",
                name: "_dex",
                type: "tuple",
            },
        ],
        name: "addDex",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint32",
                name: "",
                type: "uint32",
            },
        ],
        name: "dexes",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "isPaused",
        outputs: [
            {
                internalType: "bool",
                name: "paused",
                type: "bool",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "owner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [],
        name: "pause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "pendingOwner",
        outputs: [
            {
                internalType: "address",
                name: "",
                type: "address",
            },
        ],
        stateMutability: "view",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "uint32",
                name: "_dexId",
                type: "uint32",
            },
        ],
        name: "removeDex",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "renounceOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        internalType: "uint32",
                        name: "dexId",
                        type: "uint32",
                    },
                    {
                        internalType: "address",
                        name: "dexAddress",
                        type: "address",
                    },
                ],
                internalType: "struct RateX.DexType",
                name: "_dex",
                type: "tuple",
            },
        ],
        name: "replaceDex",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "_token",
                type: "address",
            },
            {
                internalType: "address",
                name: "_recipient",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_amount",
                type: "uint256",
            },
        ],
        name: "rescueFunds",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                components: [
                    {
                        components: [
                            {
                                internalType: "bytes",
                                name: "data",
                                type: "bytes",
                            },
                            {
                                internalType: "uint32",
                                name: "dexId",
                                type: "uint32",
                            },
                        ],
                        internalType: "struct RateX.SwapStep[]",
                        name: "swaps",
                        type: "tuple[]",
                    },
                    {
                        internalType: "uint256",
                        name: "amountIn",
                        type: "uint256",
                    },
                ],
                internalType: "struct RateX.Route[]",
                name: "_foundRoutes",
                type: "tuple[]",
            },
            {
                internalType: "address",
                name: "_tokenIn",
                type: "address",
            },
            {
                internalType: "address",
                name: "_tokenOut",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_amountIn",
                type: "uint256",
            },
            {
                internalType: "uint256",
                name: "_quotedAmountWithSlippageProtection",
                type: "uint256",
            },
            {
                internalType: "address",
                name: "_recipient",
                type: "address",
            },
            {
                internalType: "uint256",
                name: "_deadline",
                type: "uint256",
            },
        ],
        name: "swap",
        outputs: [
            {
                internalType: "uint256",
                name: "amountOut",
                type: "uint256",
            },
        ],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [
            {
                internalType: "address",
                name: "newOwner",
                type: "address",
            },
        ],
        name: "transferOwnership",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
    {
        inputs: [],
        name: "unpause",
        outputs: [],
        stateMutability: "nonpayable",
        type: "function",
    },
];
