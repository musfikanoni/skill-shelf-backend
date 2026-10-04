import { GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { envVars } from "./env";
import { s3Client } from "./S3Client.config";

/**
 * Generate temporary signed URL for private S3 file
 * @param key S3 object key (stored in DB)
 * @param expiresIn seconds (default 1 hour)
 */
export const generateSignedUrl = async (
    key: string,
    expiresIn: number = 60 * 60 // 1 hour
): Promise<string> => {
    try {
        const command = new GetObjectCommand({
            Bucket: envVars.S3.S3_BUCKET_NAME!,
            Key: key,
            ResponseContentType: "video/mp4",
        });

        const signedUrl = await getSignedUrl(
            s3Client,
            command,
            { expiresIn }
        );

        return signedUrl;
    } catch (error) {
        console.error("Signed URL generation failed:", error);
        throw new Error("Failed to generate signed URL");
    }
};