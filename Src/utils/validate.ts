export const isValidBase64Image = (base64: string): boolean => {
  const regex = /^data:image\/(png|jpeg|jpg);base64,[A-Za-z0-9+/=]+$/;
  return regex.test(base64);
};
