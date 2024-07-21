import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';
import { Readable } from 'stream';
import { ThirdwebStorage } from '@thirdweb-dev/storage';
import { ethers } from 'ethers';
import "@ethersproject/shims"

// Thirdweb storage setup
const storage = new ThirdwebStorage({ secretKey: process.env.THIRDWEB_SECRET_KEY! });

// 3. Create ethers provider
const provider = new ethers.providers.JsonRpcProvider({
    url: process.env.ETHERUM_PROVIDER_URL!,
    skipFetchSetup: true,
  }
);

const wallet = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);
const contractAddress = process.env.CONTRACT_ADDRESS!;

console.log(`${process.env.ETHEREUM_PROVIDER_URL}`);

// Smart contract ABI
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


    const contract = new ethers.Contract(contractAddress, contractAbi, wallet);

    export async function POST(req: NextRequest) {
      const formData = await req.formData();
      const file = formData.get('file') as Blob;
      const address = formData.get('address') as string;
    
      if (!file || !address) {
        return NextResponse.json({ message: 'File and address are required' }, { status: 400 });
      }
      console.log(`Received file from ${address}`);
    
      // Generate a symmetric key
      const symmetricKey = crypto.randomBytes(32);
    
      // Encrypt the file
      const fileArrayBuffer = await file.arrayBuffer();
      const iv = crypto.randomBytes(16);
      const cipher = crypto.createCipheriv('aes-256-cbc', symmetricKey, iv);
      let encrypted = Buffer.concat([cipher.update(Buffer.from(fileArrayBuffer)), cipher.final()]);
    
      // Convert encrypted file to readable stream
      const readableStream = new Readable();
      readableStream._read = () => {};
      readableStream.push(Buffer.concat([iv, encrypted]));
      readableStream.push(null);
    
      try {
        // Pin the file to IPFS using Thirdweb Storage
        const uploadResult = await storage.upload(readableStream);
        const ipfsUrl = uploadResult; // Assuming the upload result is the IPFS URL
    
        console.log(`Stored encrypted file at ${ipfsUrl}`);
    
        // Prepare data for granting access
        const fileId = 1; // Replace with actual file ID logic if needed
        const encryptedKey = ethers.utils.hexlify(symmetricKey); // Convert the symmetric key to a hex string
        console.log("the encrypted key:", encryptedKey);
        // Grant access to the address for the file
        const tx = await contract.grantAccess(fileId, address, ipfsUrl, encryptedKey, {
          gasLimit: 500000, // Adjust gas limit as necessary
        });
    
        console.log('Transaction hash:', tx.hash);
        const receipt = await tx.wait();
        console.log('Transaction was mined:', receipt);
    
        // Store the symmetric key and IPFS URL in your database or another secure storage
        console.log('Symmetric Key:', symmetricKey.toString('hex'));
        console.log('IPFS URL:', ipfsUrl);
    
        return NextResponse.json({ message: 'File uploaded and access granted successfully', ipfsUrl });
      } catch (error) {
        console.error('Error:', error);
        return NextResponse.json({ message: 'Failed to upload file or grant access', error: error }, { status: 500 });
      }
    }