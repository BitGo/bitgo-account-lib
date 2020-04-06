/**
 * An Ethereum private key in extended or raw format
 */
export type PrivateKey = {
  prv: string;
};

/**
 * An Ethereum public key in extended, compressed, or uncompressed format
 */
export type PublicKey = {
  pub: string;
};

/**
 * A seed to create Ethereum key pairs. Must be between 16 and 64 Bytes long
 */
export type Seed = {
  seed: Buffer;
};

export type KeyPairOptions = Seed | PrivateKey | PublicKey;

/**
 * @param source
 */
export function isSeed(source: KeyPairOptions): source is Seed {
  return (source as Seed).seed !== undefined;
}

/**
 * @param source
 */
export function isPrivateKey(source: KeyPairOptions): source is PrivateKey {
  return (source as PrivateKey).prv !== undefined;
}

/**
 * @param source
 */
export function isPublicKey(source: KeyPairOptions): source is PublicKey {
  return (source as PublicKey).pub !== undefined;
}

export interface Account {
  publicKey: string;
  privateKey: string;
  address: {
    hex: string;
  };
}

export interface Operation {
  to: string;
  dataToSign?: string;
  gas_limit: string;
  gas_price: string;
  counter?: string;
}

/**
 * Send transaction information
 */
export interface TransferData {
  amount: string;
  to: string;
  dataToSign?: string;
  gas_limit: string;
  gas_price: string;
  counter?: string;
}
