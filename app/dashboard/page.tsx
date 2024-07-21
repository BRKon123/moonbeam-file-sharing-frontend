"use client";
import { useState, useEffect } from 'react';
import { getUserFiles } from './getUserFiles'; // Adjust the path as necessary
import { ThirdwebStorage } from '@thirdweb-dev/storage';
import CryptoJS from 'crypto-js';

// Initialize Thirdweb Storage
const storage = new ThirdwebStorage({ secretKey: process.env.THIRDWEB_SECRET_KEY });

const Dashboard = () => {
  const [documents, setDocuments] = useState([]);

  useEffect(() => {
    const fetchDocuments = async () => {
      const userAddress = '0xf24FF3a9CF04c71Dbc94D0b566f7A27B94566cac'; // Replace with the actual user address
      const docs = await getUserFiles(userAddress);
      setDocuments(docs);
    };

    fetchDocuments();
  }, []);

  const decryptAndDownload = async (doc) => {
    try {
      const fileBuffer = await storage.download(doc.cid);
      const wordArray = CryptoJS.lib.WordArray.create(fileBuffer);
      const symmetricKey = CryptoJS.enc.Hex.parse(doc.encryptedKey);

      const decrypted = CryptoJS.AES.decrypt(
        { ciphertext: wordArray },
        symmetricKey,
        {
          mode: CryptoJS.mode.ECB,
          padding: CryptoJS.pad.Pkcs7,
        }
      );

      const decryptedBytes = CryptoJS.enc.Utf8.stringify(decrypted);
      const blob = new Blob([decryptedBytes], { type: 'application/octet-stream' });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `Document_${doc.fileId}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error decrypting and downloading file:', error);
    }
  };

  return (
    <div>
      <h1>Dashboard</h1>
      <ul>
        {documents.map((doc, index) => (
          <li key={index}>
            <span>Document {index + 1}</span> - Accessible by: {doc.owner}
            <button onClick={() => decryptAndDownload(doc)}>Download</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Dashboard;
