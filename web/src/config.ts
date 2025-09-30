// 第一种钱包的连接方式
// import { createConfig, http } from 'wagmi'
// import { mainnet, sepolia } from 'wagmi/chains'
// import { injected, metaMask, safe, walletConnect } from 'wagmi/connectors'

// const projectId = 'e36d438d742f34cfd7dce241fac09d09'

// export const config = createConfig({
//   chains: [mainnet, sepolia],
//   connectors: [
//     injected(),
//     walletConnect({ projectId }),
//     metaMask(),
//     safe(),
//   ],
//   transports: {
//     [mainnet.id]: http('https://rpc.payload.de'),
//     [sepolia.id]: http('https://ethereum-sepolia-rpc.publicnode.com'),
//   },
// })



//第二种 钱包集成sdk
import { cookieStorage, createStorage, http } from '@wagmi/core'
import { WagmiAdapter } from '@reown/appkit-adapter-wagmi'
import { mainnet, arbitrum ,sepolia} from '@reown/appkit/networks'

// Get projectId from https://dashboard.reown.com
export const projectId = 'e36d438d742f34cfd7dce241fac09d09'

if (!projectId) {
  throw new Error('Project ID is not defined')
}

export const networks = [mainnet, arbitrum,sepolia]

//Set up the Wagmi Adapter (Config)
export const wagmiAdapter = new WagmiAdapter({
  storage: createStorage({
    storage: cookieStorage
  }),
  ssr: true,
  projectId,
  networks
})

export const config = wagmiAdapter.wagmiConfig