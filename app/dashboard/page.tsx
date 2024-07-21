"use client"
import { useState, useEffect } from 'react';

interface Document {
  cid: string;
  address: string;
}

export default function Dashboard() {
  const [documents, setDocuments] = useState<Document[]>([]);

//   useEffect(() => {
//     const fetchDocuments = async () => {
//       const response = await fetch('/api/documents');
//       const result = await response.json();
//       setDocuments(result.documents);
//     };

//     fetchDocuments();
//   }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      <ul>
        {documents.map((doc, index) => (
          <li key={index}>
            {/* <a href={`https://ipfs.infura.io/ipfs/${doc.cid}`} target="_blank" rel="noopener noreferrer">
              Document {index + 1}
            </a> - Accessible by: {doc.address} */}
          </li>
        ))}
      </ul>
    </div>
  );
}
