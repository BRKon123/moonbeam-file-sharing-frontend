require('dotenv').config();
const express = require('express');
const multer = require('multer');
const crypto = require('crypto');
const { Readable } = require('stream');
const { ThirdwebStorage } = require('@thirdweb-dev/storage');
const {createPublicClient, createWalletClient, http } = require('viem');
const { privateKeyToAccount } = require('viem/accounts');
const { moonbaseAlpha } = require('viem/chains');

// Setup Express
const app = express();
const port = process.env.PORT || 3000;

// Setup Multer
const upload = multer();

// Thirdweb storage setup
const storage = new ThirdwebStorage({ secretKey: process.env.THIRDWEB_SECRET_KEY });

const account = privateKeyToAccount(process.env.PRIVATE_KEY);
const rpcUrl = 'https://rpc.api.moonbase.moonbeam.network'
const walletClient = createWalletClient({
  account,
  chain: moonbaseAlpha,
  transport: http(rpcUrl),
});

// 3. Create a public client for reading chain data
const publicClient = createPublicClient({
    chain: moonbaseAlpha,
    transport: http(rpcUrl),
  });

const contractAddress = process.env.CONTRACT_ADDRESS;

// Sma
const contractAbi = [
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

    app.post('/upload', upload.single('file'), async (req, res) => {
        const file = req.file;
        const address = req.body.address;
      
        if (!file || !address) {
          return res.status(400).json({ message: 'File and address are required' });
        }
        console.log(`Received file from ${address}`);
      
        // Generate a symmetric key
        const symmetricKey = crypto.randomBytes(32); // 256-bit key
      
        // Encrypt the file using AES-256-ECB (ECB mode does not use IV)
        const cipher = crypto.createCipheriv('aes-256-ecb', symmetricKey, null);
        let encrypted = Buffer.concat([cipher.update(file.buffer), cipher.final()]);
      
        // Convert encrypted file to readable stream
        const readableStream = new Readable();
        readableStream._read = () => {};
        readableStream.push(encrypted);
        readableStream.push(null);
      
        try {
          // Pin the file to IPFS using Thirdweb Storage
          const uploadResult = await storage.upload(readableStream);
          const ipfsUrl = uploadResult; // Assuming the upload result is the IPFS URL
      
          console.log(`Stored encrypted file at ${ipfsUrl}`);
      
          // Prepare data for granting access
          const fileId = 1; // Replace with actual file ID logic if needed
          const encryptedKey = symmetricKey.toString('hex'); // Convert the symmetric key to a hex string
          console.log("The encrypted key:", encryptedKey);
      
          // Grant access to the address for the file
          const hash = await walletClient.writeContract({
            address: contractAddress,
            abi: contractAbi,
            functionName: 'grantAccess',
            args: [fileId, address, ipfsUrl, encryptedKey],
            gasLimit: 500000, // Adjust gas limit as necessary
          });
      
          console.log('Transaction hash:', hash);
          // 7. Wait for the transaction receipt
          const receipt = await walletClient.waitForTransactionReceipt({
            hash,
          });
          console.log('Transaction was mined:', receipt);
      
          // Store the symmetric key and IPFS URL in your database or another secure storage
          console.log('Symmetric Key:', symmetricKey.toString('hex'));
          console.log('IPFS URL:', ipfsUrl);
      
          res.status(200).json({ message: 'File uploaded and access granted successfully', ipfsUrl });
        } catch (error) {
          console.error('Error:', error);
          res.status(500).json({ message: 'Failed to upload file or grant access', error: error.message });
        }
      });
      
app.listen(port, () => {
        console.log(`Server running at http://localhost:${port}`);
      });