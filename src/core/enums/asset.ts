export enum AssetStatus {
  Ready = 'READY',
  Listed = 'LISTED',
  Locked = 'LOCKED',
  Transferred = 'TRANSFERRED'
}

export enum AssetType {
  ERC721 = 'ERC721',
  ERC777 = 'ERC777',
  ERC1155 = 'ERC1155',
  CryptoPunk = 'CRYPTO_PUNK',
  Other = 'OTHER'
}

export enum CollectibleMediaType {
  Image = 'IMAGE',
  Video = 'VIDEO',
  Gif = 'GIF',
  Audio = 'AUDIO',
  ThreeD = 'THREE_D',
}

export enum Chain {
  Eth = 'eth',
  Sol = 'sol',
}
