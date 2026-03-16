// Server-side utilities for the Tatum API.
// This file should only be imported from server-side code (API routes, getServerSideProps, etc.)

export type { TatumWallet, TatumBalance, TatumTx } from './tatum-chains';
export { TATUM_CHAINS } from './tatum-chains';

export class TatumAPI {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, testnet = false) {
    this.apiKey  = apiKey;
    this.baseUrl = 'https://api.tatum.io/v3';
  }

  private async call(endpoint: string, method = 'GET', body?: any) {
    const res = await fetch(`${this.baseUrl}${endpoint}`, {
      method,
      headers: {
        'x-api-key':   this.apiKey,
        'Content-Type': 'application/json',
      },
      body: body ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ message: res.statusText }));
      throw new Error(err.message || `Tatum API error: ${res.status}`);
    }
    return res.json();
  }

  // ── Generate a new wallet (address + private key) ──────────────────────
  async generateWallet(chain: string): Promise<TatumWallet> {
    const chainInfo = TATUM_CHAINS[chain];
    if (!chainInfo) throw new Error(`Unsupported chain: ${chain}`);

    if (chainInfo.isEVM) {
      // EVM chains — use ETH wallet generation
      const data = await this.call(`/ethereum/wallet`);
      // Generate address from xpub
      const addr = await this.call(`/ethereum/address/${data.xpub}/0`);
      const key  = await this.call(`/ethereum/wallet/priv`, 'POST', {
        index:    0,
        mnemonic: data.mnemonic,
      });
      return {
        address:    addr.address,
        privateKey: key.key,
        mnemonic:   data.mnemonic,
        xpub:       data.xpub,
      };
    } else {
      // Native chains
      const chainMap: Record<string, string> = {
        BTC: 'bitcoin', LTC: 'litecoin', DOGE: 'dogecoin',
        SOL: 'solana', XRP: 'ripple', TRX: 'tron',
      };
      const path = chainMap[chain] || chain.toLowerCase();
      const data = await this.call(`/${path}/wallet`);
      const addr = await this.call(`/${path}/address/${data.xpub || data.address}/0`);
      return {
        address:  addr.address || data.address,
        mnemonic: data.mnemonic,
        xpub:     data.xpub,
      };
    }
  }

  // ── Get wallet balance ──────────────────────────────────────────────────
  async getBalance(chain: string, address: string, contractAddress?: string): Promise<string> {
    const chainInfo = TATUM_CHAINS[chain];
    if (!chainInfo) throw new Error(`Unsupported chain: ${chain}`);

    try {
      if (contractAddress && chainInfo.isEVM) {
        // ERC-20 / BEP-20 token balance
        const data = await this.call(`/blockchain/token/balance/${chainInfo.tatumId}/${contractAddress}/${address}`);
        return data.balance || '0';
      } else if (chainInfo.isEVM) {
        const data = await this.call(`/blockchain/balance/${chainInfo.tatumId}/${address}`);
        return data.balance || '0';
      } else {
        const chainMap: Record<string, string> = { BTC:'bitcoin', LTC:'litecoin', DOGE:'dogecoin', SOL:'solana', XRP:'ripple', TRX:'tron' };
        const path = chainMap[chain] || chain.toLowerCase();
        const data = await this.call(`/${path}/address/balance/${address}`);
        return data.balance || data.incoming || '0';
      }
    } catch {
      return '0';
    }
  }

  // ── Send transaction from exchange wallet to user ───────────────────────
  async sendFromExchangeWallet(params: {
    chain:            string;
    fromPrivateKey:   string;
    toAddress:        string;
    amount:           string;
    contractAddress?: string;
    tokenDecimals?:   number;
  }): Promise<TatumTx> {
    const { chain, fromPrivateKey, toAddress, amount, contractAddress, tokenDecimals } = params;
    const chainInfo = TATUM_CHAINS[chain];
    if (!chainInfo) throw new Error(`Unsupported chain: ${chain}`);

    if (contractAddress && chainInfo.isEVM) {
      // ERC-20 / BEP-20 transfer
      const data = await this.call(`/blockchain/token/transaction`, 'POST', {
        chain:        chainInfo.tatumId,
        tokenAddress: contractAddress,
        to:           toAddress,
        amount,
        fromPrivateKey,
      });
      return { txId: data.txId, status: 'pending' };
    } else if (chainInfo.isEVM) {
      const data = await this.call(`/ethereum/transaction`, 'POST', {
        to:           toAddress,
        amount,
        fromPrivateKey,
        currency:     chainInfo.symbol,
      });
      return { txId: data.txId, status: 'pending' };
    } else {
      throw new Error(`Non-EVM chain transfers not yet supported via this endpoint`);
    }
  }

  // ── Verify API key is valid ─────────────────────────────────────────────
  async verify(): Promise<boolean> {
    try {
      await this.call('/ledger/account?pageSize=1');
      return true;
    } catch {
      return false;
    }
  }

  // ── Get transaction status ──────────────────────────────────────────────
  async getTxStatus(chain: string, txId: string): Promise<string> {
    try {
      const chainInfo = TATUM_CHAINS[chain];
      const data = await this.call(`/blockchain/transaction/${chainInfo.tatumId}/${txId}`);
      return data.status === 'OK' ? 'confirmed' : 'pending';
    } catch {
      return 'unknown';
    }
  }
}

// Create instance from stored API key
export async function getTatumInstance(): Promise<TatumAPI | null> {
  try {
    const { readData } = await import('../pages/api/admin/data');
    const data = readData();
    const key  = data?.tatumSettings?.apiKey;
    if (!key) return null;
    return new TatumAPI(key, data.tatumSettings.testnet || false);
  } catch {
    return null;
  }
}
