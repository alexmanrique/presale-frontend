export const PRESALE_ADDRESS = '0x22acf670a8ef602290348f5bee655ec31ebd5038' as const
export const SALE_TOKEN_ADDRESS = '0x645b39d5b360c95f33cc047b1078be95af27e709' as const
export const USDC_ADDRESS = '0xaf88d065e77c8cC2239327C5EDb3A432268e5831' as const
export const USDT_ADDRESS = '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9' as const

export const PRESALE_ABI = [
  { type: 'function', name: 'owner', inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
  { type: 'function', name: 'currentPhase', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'totalAmountSold', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'maxSellingAmount', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'startingTime', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'endingTime', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'getEtherPrice', inputs: [], outputs: [{ type: 'uint256' }], stateMutability: 'view' },
  { type: 'function', name: 'saleTokenAddress', inputs: [], outputs: [{ type: 'address' }], stateMutability: 'view' },
  {
    type: 'function',
    name: 'phases',
    inputs: [{ name: '', type: 'uint256' }, { name: '', type: 'uint256' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'userTokenBalance',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'isBlackListed',
    inputs: [{ name: '', type: 'address' }],
    outputs: [{ type: 'bool' }],
    stateMutability: 'view',
  },
  { type: 'function', name: 'buyWithEth', inputs: [], outputs: [], stateMutability: 'payable' },
  {
    type: 'function',
    name: 'buyWithStable',
    inputs: [{ name: 'tokenUsedToBuy_', type: 'address' }, { name: 'amount_', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'function', name: 'claimTokens', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  { type: 'function', name: 'fund', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  {
    type: 'function',
    name: 'blackList',
    inputs: [{ name: 'user', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'removeBlacklist',
    inputs: [{ name: 'user_', type: 'address' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'emergencyWithdraw',
    inputs: [{ name: 'tokenAddress_', type: 'address' }, { name: 'amount_', type: 'uint256' }],
    outputs: [],
    stateMutability: 'nonpayable',
  },
  { type: 'function', name: 'emergencyWithdrawEth', inputs: [], outputs: [], stateMutability: 'nonpayable' },
  {
    type: 'event',
    name: 'TokenBuy',
    inputs: [{ name: 'user', type: 'address', indexed: false }, { name: 'amount', type: 'uint256', indexed: false }],
  },
  {
    type: 'event',
    name: 'TokensClaimed',
    inputs: [{ name: 'user', type: 'address', indexed: false }, { name: 'amount', type: 'uint256', indexed: false }],
  },
] as const

export const ERC20_ABI = [
  {
    type: 'function',
    name: 'approve',
    inputs: [{ name: 'spender', type: 'address' }, { name: 'amount', type: 'uint256' }],
    outputs: [{ type: 'bool' }],
    stateMutability: 'nonpayable',
  },
  {
    type: 'function',
    name: 'allowance',
    inputs: [{ name: 'owner', type: 'address' }, { name: 'spender', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'balanceOf',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
    stateMutability: 'view',
  },
  {
    type: 'function',
    name: 'decimals',
    inputs: [],
    outputs: [{ type: 'uint8' }],
    stateMutability: 'view',
  },
] as const
