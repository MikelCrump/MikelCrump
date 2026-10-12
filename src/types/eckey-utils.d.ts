declare module "eckey-utils" {
  export function parsePem(pem: string | Buffer): {
    privateKey: Buffer;
    publicKey: Buffer;
    curveName?: string;
  };
}
