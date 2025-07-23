export const getBase64SizeKB = (base64String: string): number => {
  const length = base64String.length;
  const sizeInBytes = 4 * Math.ceil(length / 3) * 0.5624896334383812;
  return sizeInBytes / 1024;
};
