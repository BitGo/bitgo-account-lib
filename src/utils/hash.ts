export interface HashType {
  prefix: Buffer;
  byteLength: number;
}

// Base58Check is used for encoding
// hashedTypes is used to validate hashes by type, by checking their prefix and
// the length of the Buffer obtained by decoding the hash (excluding the prefix)
export const hashTypes = {
  /* 20 bytes long */
  // ed25519 public key hash
  tz1: {
    prefix: new Buffer([6, 161, 159]),
    byteLength: 20,
  },
  // secp256k1 public key hash
  tz2: {
    prefix: new Buffer([6, 161, 161]),
    byteLength: 20,
  },
  // p256 public key hash
  tz3: {
    prefix: new Buffer([6, 161, 164]),
    byteLength: 20,
  },
  KT: {
    prefix: new Buffer([2, 90, 121]),
    byteLength: 20,
  },
  /* 32 bytes long */
  // ed25519 public key
  edpk: {
    prefix: new Buffer([13, 15, 37, 217]),
    byteLength: 32,
  },
  // ed25519 secret key
  edsk2: {
    prefix: new Buffer([13, 15, 58, 7]),
    byteLength: 32,
  },
  // secp256k1 secret key
  spsk: {
    prefix: new Buffer([17, 162, 224, 201]),
    byteLength: 32,
  },
  // p256 secret key
  p2sk: {
    prefix: new Buffer([16, 81, 238, 189]),
    byteLength: 32,
  },
  // block hash
  b: {
    prefix: new Buffer([1, 52]),
    byteLength: 32,
  },
  // operation hash
  o: {
    prefix: new Buffer([5, 116]),
    byteLength: 32,
  },
  // operation list hash
  Lo: {
    prefix: new Buffer([133, 233]),
    byteLength: 32,
  },
  // operation list list hash
  LLo: {
    prefix: new Buffer([29, 159, 109]),
    byteLength: 32,
  },
  // protocol hash
  P: {
    prefix: new Buffer([2, 170]),
    byteLength: 32,
  },
  // context hash
  Co: {
    prefix: new Buffer([79, 179]),
    byteLength: 32,
  },
  /* 33 bytes long */
  // secp256k1 public key
  sppk: {
    prefix: new Buffer([3, 254, 226, 86]),
    byteLength: 33,
  },
  // p256 public key
  p2pk: {
    prefix: new Buffer([3, 178, 139, 127]),
    byteLength: 33,
  },
  /* 56 bytes long */
  // ed25519 encrypted seed
  edesk: {
    prefix: new Buffer([7, 90, 60, 179, 41]),
    byteLength: 56,
  },
  /* 63 bytes long */
  // ed25519 secret key
  edsk: {
    prefix: new Buffer([43, 246, 78, 7]),
    byteLength: 64,
  },
  // ed25519 signature
  edsig: {
    prefix: new Buffer([9, 245, 205, 134, 18]),
    byteLength: 64,
  },
  // secp256k1 signature
  spsig1: {
    prefix: new Buffer([13, 115, 101, 19, 63]),
    byteLength: 64,
  },
  // p256_signature
  p2sig: {
    prefix: new Buffer([54, 240, 44, 52]),
    byteLength: 64,
  },
  // generic signature
  sig: {
    prefix: new Buffer([4, 130, 43]),
    byteLength: 64,
  },
  /* 15 bytes long */
  // network hash
  Net: {
    prefix: new Buffer([87, 82, 0]),
    byteLength: 15,
  },
  // nonce hash
  nce: {
    prefix: new Buffer([69, 220, 169]),
    byteLength: 15,
  },
  /* 4 bytes long */
  // chain id
  id: {
    prefix: new Buffer([153, 103]),
    byteLength: 4,
  },
};
