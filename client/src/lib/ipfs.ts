/**
 * REAL IPFS Integration using Pinata - Text Storage Only
 * 
 * 🚀 PRODUCTION SETUP:
 * 1. Set environment variables:
 *    - VITE_PINATA_API_KEY
 *    - VITE_PINATA_SECRET_KEY
 *    - VITE_IPFS_GATEWAY
 *    - VITE_IPFS_API
 * 2. Text data will be stored on REAL IPFS network
 */

// IPFS configuration - Using multiple public gateways for reliability
const IPFS_GATEWAYS = [
  'https://ipfs.io/ipfs/',
  'https://gateway.pinata.cloud/ipfs/',
  'https://cloudflare-ipfs.com/ipfs/',
  'https://dweb.link/ipfs/',
  'https://ipfs.fleek.co/ipfs/',
  'https://gateway.temporal.cloud/ipfs/',
  'https://ipfs.runfission.com/ipfs/',
  'https://4everland.io/ipfs/'
];

/**
 * REAL IPFS Upload using Pinata - Text Data Only
 * @param textData - Text content to upload
 * @param filename - Optional filename for the text
 * @returns REAL IPFS hash (CID)
 */
export async function uploadTextToIPFS(textData: string, filename: string = 'quiz-attempt.txt'): Promise<string> {
  try {
    console.log(`UPLOADING TEXT TO REAL IPFS: ${filename} (${textData.length} characters)`);
    
    if (typeof window === 'undefined') {
      throw new Error('IPFS upload only available on client side');
    }

    // Check if we have Pinata credentials for real IPFS upload
    const pinataApiKey = import.meta.env.VITE_PINATA_API_KEY;
    const pinataSecretKey = import.meta.env.VITE_PINATA_SECRET_KEY;
    
    if (pinataApiKey && pinataSecretKey) {
      try {
        console.log(`UPLOADING TO REAL IPFS via Pinata: ${filename}`);
        
        // Create a text file blob
        const textBlob = new Blob([textData], { type: 'text/plain' });
        const file = new File([textBlob], filename, { type: 'text/plain' });
        
        const formData = new FormData();
        formData.append('file', file);
        
        // Add metadata
        const metadata = JSON.stringify({
          name: filename,
          description: 'Quiz attempt data stored on IPFS',
          attributes: {
            type: 'quiz-attempt',
            timestamp: new Date().toISOString(),
            size: textData.length
          }
        });
        formData.append('pinataMetadata', metadata);
        
        const response = await fetch('https://api.pinata.cloud/pinning/pinFileToIPFS', {
          method: 'POST',
          headers: {
            'pinata_api_key': pinataApiKey,
            'pinata_secret_api_key': pinataSecretKey,
          },
          body: formData
        });
        
        if (response.ok) {
          const result = await response.json();
          const ipfsHash = result.IpfsHash;
          console.log('REAL IPFS UPLOAD SUCCESS via Pinata!');
          console.log('IPFS Hash:', ipfsHash);
          console.log('Pinata Response:', result);
          return ipfsHash;
        } else {
          const errorText = await response.text();
          console.error('Pinata upload failed:', response.status, errorText);
          throw new Error(`Pinata upload failed: ${response.status} - ${errorText}`);
        }
      } catch (error) {
        console.error('Error uploading to Pinata:', error);
        throw error;
      }
    } else {
      throw new Error('Pinata API credentials not found. Please set VITE_PINATA_API_KEY and VITE_PINATA_SECRET_KEY');
    }
    
  } catch (error) {
    console.error('❌ REAL IPFS upload failed:', error);
    
    if (error instanceof Error && error.message.includes('Pinata upload failed')) {
      throw new Error(`IPFS upload failed: ${error.message}. Please check your Pinata API keys.`);
    }
    
    throw new Error(`Failed to upload text to IPFS: ${error}`);
  }
}

/**
 * Download text from IPFS - PRODUCTION IMPLEMENTATION
 * @param ipfsHash - IPFS hash (CID)
 * @returns Promise that resolves to the text content
 */
export async function downloadTextFromIPFS(ipfsHash: string): Promise<string> {
  try {
    console.log(`Downloading text from IPFS: ${ipfsHash}`);
    
    // Try multiple gateways for reliability
    const gateways = getIPFSGatewayURLs(ipfsHash);
    
    for (const gateway of gateways) {
      try {
        const response = await fetch(`${gateway}${ipfsHash}`);
        
        if (response.ok) {
          const textContent = await response.text();
          console.log(`Text downloaded successfully from ${gateway}`);
          return textContent;
        }
      } catch (gatewayError) {
        console.warn(`Gateway ${gateway} failed:`, gatewayError);
        continue;
      }
    }
    
    throw new Error('All IPFS gateways failed');
    
  } catch (error) {
    console.error('Failed to download text from IPFS:', error);
    throw error;
  }
}

/**
 * Get IPFS gateway URL for a hash
 * @param ipfsHash - IPFS hash (CID)
 * @returns Array of gateway URLs
 */
export function getIPFSGatewayURLs(ipfsHash: string): string[] {
  return IPFS_GATEWAYS.map(gateway => `${gateway}${ipfsHash}`);
}

/**
 * Validate IPFS hash format
 * @param hash - Hash to validate
 * @returns True if valid IPFS hash
 */
export function isValidIPFSHash(hash: string): boolean {
  // Basic IPFS hash validation (starts with Qm or bafy)
  return /^Qm[1-9A-HJ-NP-Za-km-z]{44}$|^bafy[a-z2-7]{55}$/.test(hash);
}

/**
 * Get IPFS gateway URL for display
 * @param ipfsHash - IPFS hash (CID)
 * @returns Primary gateway URL
 */
export function getIPFSDisplayURL(ipfsHash: string): string {
  return `https://gateway.pinata.cloud/ipfs/${ipfsHash}`;
}
