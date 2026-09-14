import {
  CreateBucketCommand,
  GetObjectCommand,
  HeadBucketCommand,
  PutObjectCommand,
  S3Client,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { env } from "../config/env.js";
import { StorageError } from "../utils/errors.js";

const credentials = {
  accessKeyId: env.S3_ACCESS_KEY_ID,
  secretAccessKey: env.S3_SECRET_ACCESS_KEY,
};

// Server-to-server calls (upload, bucket setup) go through the internal
// endpoint. Presigned URLs are handed to browsers, so they must be signed
// against an endpoint a browser can actually resolve — that's only the same
// endpoint when S3_PUBLIC_ENDPOINT isn't set (e.g. local dev).
const internalClient = new S3Client({
  region: env.S3_REGION,
  endpoint: env.S3_ENDPOINT,
  forcePathStyle: env.S3_FORCE_PATH_STYLE,
  credentials,
});

const publicClient = env.S3_PUBLIC_ENDPOINT
  ? new S3Client({
      region: env.S3_REGION,
      endpoint: env.S3_PUBLIC_ENDPOINT,
      forcePathStyle: env.S3_FORCE_PATH_STYLE,
      credentials,
    })
  : internalClient;

export async function ensureBucket(): Promise<void> {
  try {
    await internalClient.send(new HeadBucketCommand({ Bucket: env.S3_BUCKET }));
  } catch {
    try {
      await internalClient.send(new CreateBucketCommand({ Bucket: env.S3_BUCKET }));
    } catch (error) {
      throw new StorageError(
        `Could not create or reach the "${env.S3_BUCKET}" storage bucket.`,
        error
      );
    }
  }
}

export async function uploadResumeFile(
  key: string,
  buffer: Buffer,
  mimetype: string
): Promise<void> {
  try {
    await internalClient.send(
      new PutObjectCommand({
        Bucket: env.S3_BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      })
    );
  } catch (error) {
    throw new StorageError("Could not store the resume file.", error);
  }
}

export async function getResumeDownloadUrl(key: string, filename: string): Promise<string> {
  const safeFilename = filename.replace(/["\r\n]/g, "");
  const command = new GetObjectCommand({
    Bucket: env.S3_BUCKET,
    Key: key,
    ResponseContentDisposition: `attachment; filename="${safeFilename}"`,
  });

  try {
    return await getSignedUrl(publicClient, command, { expiresIn: 300 });
  } catch (error) {
    throw new StorageError("Could not generate a download link for this resume.", error);
  }
}
