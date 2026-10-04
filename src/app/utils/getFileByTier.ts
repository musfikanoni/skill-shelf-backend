export const getFilesByTier = (product: any, tier: string) => {
  return {
    basic:
      tier === "basic" || tier === "pro" || tier === "vip"
        ? product.files.basic
        : null,

    pro:
      tier === "pro" || tier === "vip"
        ? product.files.pro
        : null,

    vip:
      tier === "vip"
        ? product.files.vip
        : null,
  };
};