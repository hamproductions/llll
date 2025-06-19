declare module 'webp-converter' {
  interface WebpConverter {
    grant_permission: () => void;
    cwebp: (inputFile: string, outputFile: string, option: string) => Promise<string>; // The promise resolves with a string, often a status message.
  }
  const webpConverter: WebpConverter;
  export default webpConverter;
}
