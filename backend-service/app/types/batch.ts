export type BatchRequest = {
  batch: { type: "bus"; city: string; id: string }[];
};
