import { createPublicClient, webSocket, http, parseAbiItem } from "viem";
import { mainnet } from "viem/chains";

import {
    parseAbi,
    encodePacked,
    decodeAbiParameters,
    encodeAbiParameters,
} from "viem";

const abi = parseAbi([
    "function name() view returns (string)",
    "function balanceOf(address) view returns (uint256)",
    "function transfer(address, uint256) returns (bool)",
    "event Transfer(address indexed from, address indexed to, uint256 value)",
]);

// 编码ABI
// 注意使用 encodePacked 给出的是紧凑编码

const encodeData = encodeAbiParameters(abi[2].inputs, [
    "0x0D70b38d43F9AA812548fEE43bEB97e2a5E7450B",
    BigInt(753000000),
]);
// console.log("encodeData:", encodeData);

const decodeDatas = decodeAbiParameters(abi[2].inputs, encodeData);
// console.log("decodeDatas:", decodeDatas);

// 1. 知道自己的合约的ABI
// 2. 然后才能根据ABI去解析数据

const client = createPublicClient({
    chain: mainnet,
    // transport: webSocket("wss://0xrpc.io/eth"),

    // https://dashboard.particle.network/#/endpoint 数据服务商节点提供的
    transport: http(
        "https://rpc.particle.network/evm-chain?chainId=1&projectUuid=b765cb95-3c59-4a3e-8604-67a14a07a842&projectKey=clOdIFqAoupnzE1TgDHuM1AVjOS7sUjGeIOzUCHZ"
    ),
});

async function fetchTransfer() {

    // 获取当前区块高度(从最近40个区块开始采集数据)
    let startBlock = await client.getBlockNumber();
    startBlock = startBlock - BigInt(40);
    let endBlock

    for (let i = 0; i < 10; i++) {
        // 当前区块高度
        const currentBlock = await client.getBlockNumber();
        // 我们不采集最新的3个区块的数据，如果太大了，我们等一会儿，等数据稳定
        // pos
        if (startBlock > currentBlock - BigInt(3)) {
            console.log("等待数据稳定");
            await new Promise((resolve) => setTimeout(resolve, 10000));
            continue;
        }

        endBlock = startBlock + BigInt(10);
        console.log('endBlock: ', endBlock,startBlock);

        // 监听转账
        const filter = await client.createEventFilter({
            address: "0xdAC17F958D2ee523a2206206994597C13D831ec7",
            event: parseAbiItem(
                "event Transfer(address indexed from, address indexed to, uint256 value)"
            ), //转账 事件名称编码
            fromBlock: BigInt(startBlock), //16330000n,
            toBlock: endBlock, // 16330050n
        });

        // check 高度是否超过了当前区块的高度，如果是，则等会采集
        startBlock =endBlock + BigInt(1);

        // 获取日志信息
        const logs = await client.getFilterLogs({ filter });

        logs.forEach((log) => {
            console.log(
                `从 ${log.args.from} 转账给 ${log.args.to} ${
                    log.args.value! / BigInt(1e6)
                }USDT,
            https://etherscan.io/tx/${log.transactionHash}`
            );
        });
    }





    // 获取余额
    // const amount = await client.getBalance({
    //     address: "0x0000000000000715b0d6f54c40a34d7c3d5e9f56",
    // });
    // console.log(amount);
}


// 监听转账事件
async function fetchWatchEvent() {
    // 获取交易回执，用于判断交易是否成功
    // const transaction = await client.waitForTransactionReceipt( 
    //   { hash: '0x4ca7ee652d57678f26e887c149ab0735f41de37bcad58c9f6d3ed5824f15b74d' }
    // )

    const unwatch = client.watchEvent({
        address: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
        event: parseAbiItem('event Transfer(address indexed from, address indexed to, uint256 value)'), 
        onLogs: onTransfer,
        // fromBlock: BigInt(16330000n),
    })

    //取消监听
    setTimeout(() => {
       unwatch() 
    },10*1000)
}

//展示数据
function onTransfer(logs:any){
    logs.forEach((log:any) => {
        console.log(
            `从 ${log.args.from} 转账给 ${log.args.to} ${
                log.args.value! / BigInt(1e6)
            }USDT,
        https://etherscan.io/tx/${log.transactionHash}`
        );
    });
}


//监听新区块
async function fetchNewBlock() {

    const unwatchBlocks = await client.watchBlocks(
        { 
            //获取更多的区块信息
            onBlock: block => console.log(block,block.number,block.hash),
            pollingInterval: 1_000, 
        }
    );


    //监听区块高度
    const unwatch = client.watchBlockNumber(
        { 
            //监听新出的区块
            onBlockNumber: blockNumber => console.log(blockNumber),
        }
    )
}



// fetchTransfer().catch((err) => console.log(err));

// fetchWatchEvent().catch((err) => console.log(err));
fetchNewBlock().catch((err) => console.log(err));
