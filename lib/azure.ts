import { BlobServiceClient } from "@azure/storage-blob";

export const AZURE_CONFIG = {
  accountName: process.env.Azure_StorageAccount_Name || "smartlms",
  containerName: process.env.Azure_StorageAccount_Container_Name || "course-content",
  connectionString: process.env.Azure_StorageAccount_ConnectionString || "",
};

function getContainerClient() {
  if (!AZURE_CONFIG.connectionString) {
    throw new Error(
      "Azure_StorageAccount_ConnectionString is not set. Add it to your environment variables."
    );
  }
  // The connection string carries the AccountKey; the SDK signs every request with it (Shared Key auth).
  return BlobServiceClient.fromConnectionString(
    AZURE_CONFIG.connectionString
  ).getContainerClient(AZURE_CONFIG.containerName);
}

/** Uploads a file to Azure Blob Storage using the account key. Throws if the blob was not stored. */
export async function uploadBlobToAzure(
  blobName: string,
  buffer: Buffer,
  contentType = "video/mp4"
): Promise<{ success: boolean; url: string }> {
  const blob = getContainerClient().getBlockBlobClient(blobName);
  await blob.uploadData(buffer, { blobHTTPHeaders: { blobContentType: contentType } });
  return { success: true, url: blob.url };
}
