import { cloudinary } from "./cloudinary.config";

/**
 * Generate a temporary signed URL for a Cloudinary private/restricted asset.
 * For public Cloudinary videos the stored URL can be used directly,
 * but this helper is kept for parity with the old S3 signed-URL API.
 *
 * @param publicIdOrUrl  Cloudinary public_id OR full Cloudinary URL
 * @param expiresIn      Validity in seconds (default 1 hour)
 */
export const generateSignedUrl = async (
  publicIdOrUrl: string,
  expiresIn: number = 60 * 60 // 1 hour
): Promise<string> => {
  try {
    // If it's already a full URL, return as-is (Cloudinary public delivery)
    if (publicIdOrUrl.startsWith("http")) {
      return publicIdOrUrl;
    }

    // Generate a signed Cloudinary URL for private/restricted resources
    const signedUrl = cloudinary.url(publicIdOrUrl, {
      secure: true,
      resource_type: "video",
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + expiresIn,
    });

    return signedUrl;
  } catch (error) {
    console.error("Cloudinary signed URL generation failed:", error);
    throw new Error("Failed to generate signed URL");
  }
};