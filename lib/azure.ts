import crypto from "crypto";

export const AZURE_CONFIG = {
  accountName: process.env.Azure_StorageAccount_Name || "smartlms",
  containerName: process.env.Azure_StorageAccount_Container_Name || "course-content",
  connectionString: process.env.Azure_StorageAccount_ConnectionString || "",
};

/**
 * Extracts AccountName and AccountKey from the connection string in .env.local
 */
export function parseConnectionString(connectionString: string) {
  const parts = connectionString.split(";");
  let accountName = "";
  let accountKey = "";

  for (const part of parts) {
    if (part.startsWith("AccountName=")) {
      accountName = part.substring("AccountName=".length);
    } else if (part.startsWith("AccountKey=")) {
      accountKey = part.substring("AccountKey=".length);
    }
  }

  return { accountName, accountKey };
}

/**
 * Generates an Azure Blob Shared Access Signature (SAS) URL if private container streaming is needed
 */
export function generateAzureSasUrl(
  blobPath: string,
  durationHours: number = 24 * 365
): string {
  const connStr = AZURE_CONFIG.connectionString;
  const { accountName, accountKey } = parseConnectionString(connStr);

  const accName = accountName || AZURE_CONFIG.accountName;
  if (!accName || !accountKey) {
    // If credentials are not present, return direct link
    return `https://${accName}.blob.core.windows.net/${AZURE_CONFIG.containerName}/${encodeURIComponent(blobPath)}`;
  }

  const signedPermissions = "r"; // Read access
  const now = new Date();
  const startTime = new Date(now.getTime() - 5 * 60 * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
  const expiryTime = new Date(now.getTime() + durationHours * 3600 * 1000).toISOString().replace(/\.\d{3}Z$/, "Z");
  const signedVersion = "2020-10-02";
  const signedResource = "b";
  const signedProtocol = "https";

  const canonicalizedResource = `/blob/${accName}/${AZURE_CONFIG.containerName}/${blobPath}`;

  const stringToSign = [
    signedPermissions,
    startTime,
    expiryTime,
    canonicalizedResource,
    "", // signedIdentifier
    "", // signedIP
    signedProtocol,
    signedVersion,
    signedResource,
    "", // signedSnapshotTime
    "", // signedEncryptionScope
    "", // rscc
    "", // rscd
    "", // rsce
    "", // rscl
    "", // rsct
  ].join("\n");

  const keyBuffer = Buffer.from(accountKey, "base64");
  const signature = crypto
    .createHmac("sha256", keyBuffer)
    .update(stringToSign, "utf8")
    .digest("base64");

  const queryParams = new URLSearchParams({
    sp: signedPermissions,
    st: startTime,
    se: expiryTime,
    spr: signedProtocol,
    sv: signedVersion,
    sr: signedResource,
    sig: signature,
  });

  const encodedBlob = encodeURIComponent(blobPath).replace(/%2F/g, "/");
  return `https://${accName}.blob.core.windows.net/${AZURE_CONFIG.containerName}/${encodedBlob}?${queryParams.toString()}`;
}

