// 第一种钱包的连接方式
// import type { AppProps } from "next/app";
// import Layout from "@/components/layout";
// import { ToastContainer } from "react-toastify";
// import "@/styles/globals.css";
// import "react-toastify/dist/ReactToastify.css";

// import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
// import { WagmiProvider } from 'wagmi'
// import { config } from '../config'

// const queryClient = new QueryClient()

// export default function App({ Component, pageProps }: AppProps) {
//   return (
//      <WagmiProvider config={config}>
//         <QueryClientProvider client={queryClient}> 
//           <Layout>
//             <ToastContainer />
//             <Component {...pageProps} />
//           </Layout>
//         </QueryClientProvider>
//      </WagmiProvider>

//   );
// }





//第二种 钱包集成sdk
import type { AppProps } from "next/app";
import Layout from "@/components/layout";
import { ToastContainer } from "react-toastify";
import "@/styles/globals.css";
import "react-toastify/dist/ReactToastify.css";

import { wagmiAdapter, projectId } from '@/config'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { createAppKit } from '@reown/appkit/react'
import { mainnet, arbitrum,sepolia } from '@reown/appkit/networks'
import React, { type ReactNode } from 'react'
import { cookieToInitialState, WagmiProvider, type Config } from 'wagmi'



  let cookiesobj:any
// Pages Router 方式 (在 Next.js 的 Pages Router 中，getServerSideProps 是一个特殊的函数，不需要手动调用，它会在每次页面请求时由 Next.js 自动执行)
export const getServerSideProps = async (context: { req: { headers: { [x: string]: any; }; }; }) => {
    // 获取所有 cookie 字符串
  const cookieHeader = context.req.headers.cookie || ''

  // // 解析 cookie 的辅助函数
  // function parseCookies(cookieHeader: string): Record<string, string> {
  //   const cookies: Record<string, string> = {}
    
  //   if (cookieHeader) {
  //     cookieHeader.split(';').forEach(cookie => {
  //       const [name, value] = cookie.trim().split('=')
  //       if (name && value) {
  //         cookies[name] = decodeURIComponent(value)
  //       }
  //     })
  //   }
    
  //   return cookies
  // }
  
  // 解析 cookie
  //  cookiesobj = parseCookies(cookieHeader)
   cookiesobj = cookieHeader
   console.log('cookiesobj: ', cookiesobj);
}



// Set up queryClient
const queryClient = new QueryClient()

if (!projectId) {
  throw new Error('Project ID is not defined')
}

// Set up metadata
const metadata = {
  name: 'appkit-example',
  description: 'AppKit Example',
  url: 'https://appkitexampleapp.com', // origin must match your domain & subdomain
  icons: ['https://avatars.githubusercontent.com/u/179229932']
}

// Create the modal
const modal = createAppKit({
  adapters: [wagmiAdapter],
  projectId,
  networks: [mainnet, arbitrum,sepolia],
  defaultNetwork: mainnet,
  metadata: metadata,
  features: {
    analytics: true // Optional - defaults to your Cloud configuration
  }
})

function ContextProvider({ children, cookies }: { children: ReactNode; cookies: string | null }) {
  const initialState = cookieToInitialState(wagmiAdapter.wagmiConfig as Config, cookies)

  return (
    <WagmiProvider config={wagmiAdapter.wagmiConfig as Config} initialState={initialState}>
      <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    </WagmiProvider>
  )

}

function App({ Component, pageProps }: AppProps) {
    return (

       <ContextProvider cookies={cookiesobj}>
            <Layout>
              <ToastContainer />
              <Component {...pageProps} />
            </Layout>

      </ContextProvider>
      
    );
  }


export default App
