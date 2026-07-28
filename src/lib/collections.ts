export const COLLECTIONS = ["Herbarium", "Folia"] as const;
export type CollectionId = (typeof COLLECTIONS)[number];

export const DEFAULT_COLLECTION: CollectionId = "Herbarium";

export const isCollectionId = (value: string | null | undefined): value is CollectionId =>
  value === "Herbarium" || value === "Folia";

export const parseCollection = (value: string | null | undefined): CollectionId =>
  isCollectionId(value) ? value : DEFAULT_COLLECTION;

export const parseCollectionInput = (value: unknown): CollectionId => {
  const raw = typeof value === "string" ? value.trim() : "";
  return isCollectionId(raw) ? raw : DEFAULT_COLLECTION;
};

export const collectionImagePath = (collection: CollectionId) =>
  `/images/collections/${collection.toLowerCase()}.jpg`;

export const collectionImageObjectPosition = (collection: CollectionId) => {
  // Keep jewelry subjects centered in landscape collection crops.
  if (collection === "Herbarium") return "46% 40%";
  return "52% 42%";
};
