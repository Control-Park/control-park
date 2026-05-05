export const localImageMap: Record<string, any> = {
  "164352ef-c16a-433b-bf34-3a7f2e33cea2": require("../../assets/thaipicture.png"),
  "b836ae95-47fb-45cc-9451-761326f06b5d": require("../../assets/parking1.png"),
  "ca8a9ed1-f1ce-40c9-bae5-0e8d145c7a3b": require("../../assets/parking2.png"),
  "eb0c07c6-977e-4a55-9469-678626f95a91": require("../../assets/parking3.png"),
  "30d3ad11-bd54-4990-ab29-e1a4d831983e": require("../../assets/parking4.png"),
  "03dd697f-ae0b-45b1-b73a-9d8f57c4f777": require("../../assets/parking5.png"),
};

type ListingWithImages = {
  id: string;
  images?: any[];
};

function isUsableImage(image: unknown) {
  return (
    !!image &&
    (typeof image !== "string" || !image.startsWith("blob:"))
  );
}

export function getListingImages(item: ListingWithImages) {
  const mappedImage = localImageMap[item.id];
  if (mappedImage) return [mappedImage];
  if (item.images?.length) {
    return item.images.map((image) =>
      typeof image === "string" ? { uri: image } : image,
    );
  }
  return [require("../../assets/parking1.png")];
}

export function getUploadedListingImageUri(item: ListingWithImages) {
  const image = item.images?.find(isUsableImage);
  return typeof image === "string" ? image : null;
}

export function getListingImage(item: ListingWithImages) {
  const mappedImage = localImageMap[item.id];
  if (mappedImage) return mappedImage;
  if (item.images?.length) {
    return typeof item.images[0] === "string"
      ? { uri: item.images[0] }
      : item.images[0];
  }
  return require("../../assets/parking1.png");
}
