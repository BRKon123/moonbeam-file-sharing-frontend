// 1. Update imports
import { createPublicClient, createWalletClient, http } from 'viem';
import { privateKeyToAccount } from 'viem/accounts';
import { moonbaseAlpha } from 'viem/chains';


// 2. Create a public client for reading chain data
const rpcUrl = 'https://rpc.api.moonbase.moonbeam.network';
const publicClient = createPublicClient({
  chain: moonbaseAlpha,
  transport: http(rpcUrl),
});

// 3. Create a wallet client for writing chain data
const account = privateKeyToAccount(process.env.PRIVATE_KEY);
const walletClient = createWalletClient({
  account,
  chain: moonbaseAlpha,
  transport: http(rpcUrl),
});

// 4. Create contract variables
const contractAddress = process.env.CONTRACT_ADDRESS;


const abi = [
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "grantee",
                "type": "address"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "encryptedKey",
                "type": "string"
            }
        ],
        "name": "AccessGranted",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "revokee",
                "type": "address"
            }
        ],
        "name": "AccessRevoked",
        "type": "event"
    },
    {
        "anonymous": false,
        "inputs": [
            {
                "indexed": false,
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            },
            {
                "indexed": false,
                "internalType": "string",
                "name": "cid",
                "type": "string"
            },
            {
                "indexed": false,
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "name": "FileAdded",
        "type": "event"
    },
    {
        "inputs": [],
        "name": "fileCount",
        "outputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "",
                "type": "uint256"
            }
        ],
        "name": "files",
        "outputs": [
            {
                "internalType": "string",
                "name": "cid",
                "type": "string"
            },
            {
                "internalType": "address",
                "name": "owner",
                "type": "address"
            }
        ],
        "stateMutability": "view",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getEncryptedKey",
        "outputs": [
            {
                "internalType": "string",
                "name": "",
                "type": "string"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "getUserFiles",
        "outputs": [
            {
                "internalType": "uint256[]",
                "name": "",
                "type": "uint256[]"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "grantee",
                "type": "address"
            },
            {
                "internalType": "string",
                "name": "cid",
                "type": "string"
            },
            {
                "internalType": "string",
                "name": "encryptedKey",
                "type": "string"
            }
        ],
        "name": "grantAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "user",
                "type": "address"
            }
        ],
        "name": "hasAccess",
        "outputs": [
            {
                "internalType": "bool",
                "name": "",
                "type": "bool"
            }
        ],
        "stateMutability": "nonpayable",
        "type": "function"
    },
    {
        "inputs": [
            {
                "internalType": "uint256",
                "name": "fileId",
                "type": "uint256"
            },
            {
                "internalType": "address",
                "name": "revokee",
                "type": "address"
            }
        ],
        "name": "revokeAccess",
        "outputs": [],
        "stateMutability": "nonpayable",
        "type": "function"
    }
];

// Function to get user files
export const getUserFiles = async (userAddress: string) => {
  // Fetch user files
  const fileIds = await publicClient.readContract({
    abi,
    functionName: 'getUserFiles',
    address: contractAddress,
    args: [userAddress],
  });

  const documents = [];

  // Fetch encrypted key for each file
  for (const fileId of fileIds) {
    const encryptedKey = await publicClient.readContract({
      abi,
      functionName: 'getEncryptedKey',
      address: contractAddress,
      args: [fileId, userAddress],
    });

    const fileData = await publicClient.readContract({
      abi,
      functionName: 'files',
      address: contractAddress,
      args: [fileId],
    });

    documents.push({
      fileId,
      cid: fileData.cid,
      encryptedKey,
      owner: fileData.owner,
    });
  }

  return documents;
};
