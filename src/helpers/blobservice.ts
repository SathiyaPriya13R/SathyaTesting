import { BlobServiceClient, StorageSharedKeyCredential } from "@azure/storage-blob";
import fs from 'fs'
import 'dotenv/config';
import AppConstants from "../utils/constants";
import { Readable } from "stream";
const logger = require('../helpers/logger');

const appConstant = new AppConstants();

export default class BlobService {

    private account_name = `${process.env.AZURE_STORAGE_ACCOUNT_NAME}`
    private account_key = `${process.env.AZURE_STORAGE_ACCOUNT_KEY}`;
    private container_name = `${process.env.PROVIDER_CONTAINER_NAME}`;

    async uploadStreamToBlobStorage(file: any, blob_name: string) {
        try {
            logger.info(appConstant.DOCUMENT_MESSAGES.DOCUMENT_UPLOAD_IN_BLOBSTORAGE_STARTED);

            const filePath = file.path;
            const fileStream: any = fs.createReadStream(filePath);

            const sharedKeyCredential = new StorageSharedKeyCredential(this.account_name, this.account_key);
            const blobServiceClient = new BlobServiceClient(`https://${this.account_name}.blob.core.windows.net`, sharedKeyCredential);

            const containerClient = blobServiceClient.getContainerClient(this.container_name);
            await containerClient.createIfNotExists();

            const blobClient = containerClient.getBlockBlobClient(blob_name);
            await blobClient.uploadStream(fileStream, fileStream.byteLength, 4, { blobHTTPHeaders: { blobContentType: "application/octet-stream" } })
            logger.info(appConstant.DOCUMENT_MESSAGES.DOCUMENT_UPLOAD_IN_BLOBSTORAGE_COMPLETED);
            return (blobClient && blobClient.url) ? blobClient.url : null

        } catch (error: any) {
            logger.error(appConstant.DOCUMENT_MESSAGES.DOCUMENT_UPLOAD_IN_BLOBSTORAGE_FAILED, error.message);
        }
    }


    async uploadEsignDocuToBlobStorage(file: any, blob_name: string) {
        try {
            logger.info(appConstant.DOCUMENT_MESSAGES.DOCUMENT_UPLOAD_IN_BLOBSTORAGE_STARTED);

            const filePath = file;
            const readableStream = new Readable();
            readableStream._read = () => { }; // No-op, needed for readable streams
            readableStream.push(filePath);
            readableStream.push(null); // End of stream

            const sharedKeyCredential = new StorageSharedKeyCredential(this.account_name, this.account_key);
            const blobServiceClient = new BlobServiceClient(`https://${this.account_name}.blob.core.windows.net`, sharedKeyCredential);

            const containerClient = blobServiceClient.getContainerClient(this.container_name);
            await containerClient.createIfNotExists();

            const blobClient = containerClient.getBlockBlobClient(blob_name);
            await blobClient.uploadStream(readableStream, readableStream.readableLength, 4, { blobHTTPHeaders: { blobContentType: "application/octet-stream" } })
            logger.info(appConstant.DOCUMENT_MESSAGES.DOCUMENT_UPLOAD_IN_BLOBSTORAGE_COMPLETED);
            return (blobClient && blobClient.url) ? blobClient.url : null

        } catch (error: any) {
            logger.error(appConstant.DOCUMENT_MESSAGES.DOCUMENT_UPLOAD_IN_BLOBSTORAGE_FAILED, error.message);
        }
    }
}
