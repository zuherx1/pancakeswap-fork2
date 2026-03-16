import type { NextApiRequest, NextApiResponse } from 'next';
import { verifyToken } from '../admin/login';
import { readData, writeData } from '../admin/data';
import { TatumAPI } from '../../../utils/tatum-server';

function auth(req: NextApiRequest) {
  const t = req.headers.authorization?.replace('Bearer ', '');
  return t ? verifyToken(t) !== null : false;
}

function getTatum(): TatumAPI | null {
  const data = readData();
  const key  = data?.tatumSettings?.apiKey;
  if (!key) return null;
  return new TatumAPI(key, data.tatumSettings?.testnet || false);
}

/* ─── Calculate pending rewards ──────────────────────────────────────────── */
function calcPendingRewards(stake: any, pool: any): number {
  const now          = Date.now();
  const lastClaimed  = stake.lastClaimedAt ? new Date(stake.lastClaimedAt).getTime() : new Date(stake.stakedAt).getTime();
  const elapsedMs    = now - lastClaimed;
  const elapsedYears = elapsedMs / (1000 * 60 * 60 * 24 * 365);
  const aprRate      = (pool.aprPercent || 0) / 100;
  return stake.amount * aprRate * elapsedYears;
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { action } = req.query;
  const data       = readData();

  /* ── GET public actions ─────────────────────────────────────────────────── */

  // List all active pools (public)
  if (req.method === 'GET' && action === 'pools') {
    const pools = (data.localStakingPools || []).filter((p: any) => p.enabled !== false);
    return res.status(200).json(pools);
  }

  // Get user's stakes (public — wallet address in query)
  if (req.method === 'GET' && action === 'my-stakes') {
    const { address } = req.query;
    if (!address) return res.status(400).json({ error: 'address required' });
    const stakes = (data.userStakes || []).filter((s: any) =>
      s.userAddress.toLowerCase() === (address as string).toLowerCase() && s.status === 'active'
    );
    // Enrich with pending rewards
    const pools = data.localStakingPools || [];
    const enriched = stakes.map((s: any) => {
      const pool    = pools.find((p: any) => p.id === s.poolId);
      const pending = pool ? calcPendingRewards(s, pool) : 0;
      return { ...s, pendingRewards: pending };
    });
    return res.status(200).json(enriched);
  }

  /* ── POST public actions (user interactions) ────────────────────────────── */

  // Stake into a pool
  if (req.method === 'POST' && action === 'stake') {
    const { poolId, amount, userAddress, txId } = req.body;
    if (!poolId || !amount || !userAddress) {
      return res.status(400).json({ error: 'poolId, amount, and userAddress required' });
    }
    const pool = (data.localStakingPools || []).find((p: any) => p.id === poolId);
    if (!pool) return res.status(404).json({ error: 'Pool not found' });
    if (!pool.enabled) return res.status(400).json({ error: 'Pool is not active' });

    const amtNum = parseFloat(amount);
    if (isNaN(amtNum) || amtNum <= 0) return res.status(400).json({ error: 'Invalid amount' });
    if (pool.minStake && amtNum < pool.minStake) {
      return res.status(400).json({ error: `Minimum stake is ${pool.minStake} ${pool.tokenSymbol}` });
    }

    if (!Array.isArray(data.userStakes)) data.userStakes = [];

    const newStake = {
      id:            `stake-${Date.now()}`,
      poolId,
      poolName:      pool.name,
      tokenSymbol:   pool.tokenSymbol,
      rewardSymbol:  pool.rewardSymbol,
      userAddress,
      amount:        amtNum,
      stakedAt:      new Date().toISOString(),
      lastClaimedAt: new Date().toISOString(),
      depositTxId:   txId || null,
      status:        'active',
      totalClaimed:  0,
    };

    data.userStakes.push(newStake);

    // Update pool TVL
    const pIdx = data.localStakingPools.findIndex((p: any) => p.id === poolId);
    if (pIdx !== -1) {
      data.localStakingPools[pIdx].totalStaked =
        (data.localStakingPools[pIdx].totalStaked || 0) + amtNum;
    }

    writeData(data);
    return res.status(201).json({ success: true, stake: newStake });
  }

  // Claim rewards — auto-sends from exchange wallet via Tatum
  if (req.method === 'POST' && action === 'claim') {
    const { stakeId } = req.body;
    const stake = (data.userStakes || []).find((s: any) => s.id === stakeId);
    if (!stake) return res.status(404).json({ error: 'Stake not found' });
    if (stake.status !== 'active') return res.status(400).json({ error: 'Stake is not active' });

    const pool = (data.localStakingPools || []).find((p: any) => p.id === stake.poolId);
    if (!pool) return res.status(404).json({ error: 'Pool not found' });

    const pendingRewards = calcPendingRewards(stake, pool);

    if (pendingRewards < (pool.minClaimAmount || 0.0001)) {
      return res.status(400).json({
        error:          `Minimum claimable amount is ${pool.minClaimAmount || 0.0001} ${pool.rewardSymbol}`,
        pendingRewards,
      });
    }

    // Find reward exchange wallet
    const wallets = data.exchangeWallets || [];
    const tokens  = data.tokens || [];
    const rewardWallet = wallets.find((w: any) => {
      const tok = w.tokenId ? tokens.find((t: any) => t.id === w.tokenId) : null;
      if (tok) return tok.symbol === pool.rewardSymbol;
      const { TATUM_CHAINS } = require('../../../utils/tatum');
      return TATUM_CHAINS[w.chain]?.symbol === pool.rewardSymbol;
    });

    if (!rewardWallet) {
      return res.status(400).json({
        error:    `No exchange wallet found for ${pool.rewardSymbol} rewards. Contact support.`,
        noWallet: true,
        pendingRewards,
      });
    }

    const walletBalance = parseFloat(rewardWallet.balance || '0');
    if (walletBalance < pendingRewards) {
      return res.status(400).json({
        error:             `Insufficient reward balance. Available: ${walletBalance.toFixed(6)} ${pool.rewardSymbol}`,
        insufficientFunds: true,
        pendingRewards,
        available:         walletBalance,
      });
    }

    // Send via Tatum
    const tatum = getTatum();
    let txId: string | null = null;

    if (tatum) {
      try {
        const tok = rewardWallet.tokenId
          ? tokens.find((t: any) => t.id === rewardWallet.tokenId)
          : null;
        const tx = await tatum.sendFromExchangeWallet({
          chain:           rewardWallet.chain,
          fromPrivateKey:  rewardWallet.privateKey,
          toAddress:       stake.userAddress,
          amount:          pendingRewards.toFixed(6),
          contractAddress: tok?.contractAddress,
          tokenDecimals:   tok?.decimals || 18,
        });
        txId = tx.txId;

        // Deduct from wallet balance
        const wIdx = data.exchangeWallets.findIndex((w: any) => w.id === rewardWallet.id);
        if (wIdx !== -1) {
          data.exchangeWallets[wIdx].balance =
            Math.max(0, walletBalance - pendingRewards).toString();
        }
      } catch (e: any) {
        return res.status(500).json({
          error:         `Payout failed: ${e.message}`,
          pendingRewards,
        });
      }
    }

    // Update stake record
    const sIdx = data.userStakes.findIndex((s: any) => s.id === stakeId);
    if (sIdx !== -1) {
      data.userStakes[sIdx].lastClaimedAt = new Date().toISOString();
      data.userStakes[sIdx].totalClaimed  = (data.userStakes[sIdx].totalClaimed || 0) + pendingRewards;
    }

    // Record payout history
    if (!Array.isArray(data.stakingPayouts)) data.stakingPayouts = [];
    data.stakingPayouts.unshift({
      id:          `payout-${Date.now()}`,
      type:        'reward_claim',
      stakeId,
      poolId:      stake.poolId,
      poolName:    pool.name,
      amount:      pendingRewards,
      symbol:      pool.rewardSymbol,
      userAddress: stake.userAddress,
      walletId:    rewardWallet.id,
      txId,
      status:      txId ? 'sent' : 'pending',
      timestamp:   new Date().toISOString(),
    });

    writeData(data);

    return res.status(200).json({
      success:        true,
      claimed:        pendingRewards,
      txId,
      pending:        !txId,
      message:        txId
        ? `${pendingRewards.toFixed(6)} ${pool.rewardSymbol} sent to your wallet!`
        : `${pendingRewards.toFixed(6)} ${pool.rewardSymbol} reward recorded (Tatum not configured — pending manual payout)`,
    });
  }

  // Unstake — send principal back + final rewards via Tatum
  if (req.method === 'POST' && action === 'unstake') {
    const { stakeId } = req.body;
    const stake = (data.userStakes || []).find((s: any) => s.id === stakeId);
    if (!stake) return res.status(404).json({ error: 'Stake not found' });
    if (stake.status !== 'active') return res.status(400).json({ error: 'Already unstaked' });

    const pool = (data.localStakingPools || []).find((p: any) => p.id === stake.poolId);
    if (!pool) return res.status(404).json({ error: 'Pool not found' });

    // Check lock period
    if (pool.lockDays && pool.lockDays > 0) {
      const stakedAt   = new Date(stake.stakedAt).getTime();
      const unlockTime = stakedAt + pool.lockDays * 24 * 60 * 60 * 1000;
      if (Date.now() < unlockTime) {
        const remaining = Math.ceil((unlockTime - Date.now()) / (24 * 60 * 60 * 1000));
        return res.status(400).json({
          error:   `Tokens are locked for ${remaining} more day(s)`,
          locked:  true,
          remaining,
        });
      }
    }

    const pendingRewards = calcPendingRewards(stake, pool);
    const wallets = data.exchangeWallets || [];
    const tokens  = data.tokens || [];

    // Find principal wallet (staked token)
    const principalWallet = wallets.find((w: any) => {
      const tok = w.tokenId ? tokens.find((t: any) => t.id === w.tokenId) : null;
      if (tok) return tok.symbol === pool.tokenSymbol;
      const { TATUM_CHAINS } = require('../../../utils/tatum');
      return TATUM_CHAINS[w.chain]?.symbol === pool.tokenSymbol;
    });

    // Find reward wallet
    const rewardWallet = pool.rewardSymbol === pool.tokenSymbol
      ? principalWallet
      : wallets.find((w: any) => {
          const tok = w.tokenId ? tokens.find((t: any) => t.id === w.tokenId) : null;
          if (tok) return tok.symbol === pool.rewardSymbol;
          const { TATUM_CHAINS } = require('../../../utils/tatum');
          return TATUM_CHAINS[w.chain]?.symbol === pool.rewardSymbol;
        });

    if (!principalWallet) {
      return res.status(400).json({
        error: `No exchange wallet for ${pool.tokenSymbol}. Contact support.`,
      });
    }

    const tatum       = getTatum();
    let   principalTx: string | null = null;
    let   rewardTx:    string | null = null;

    if (tatum && principalWallet) {
      try {
        const tok = principalWallet.tokenId
          ? tokens.find((t: any) => t.id === principalWallet.tokenId)
          : null;

        // Send principal back
        const txP = await tatum.sendFromExchangeWallet({
          chain:           principalWallet.chain,
          fromPrivateKey:  principalWallet.privateKey,
          toAddress:       stake.userAddress,
          amount:          stake.amount.toFixed(6),
          contractAddress: tok?.contractAddress,
          tokenDecimals:   tok?.decimals || 18,
        });
        principalTx = txP.txId;

        // Update principal wallet balance
        const pWIdx = data.exchangeWallets.findIndex((w: any) => w.id === principalWallet.id);
        if (pWIdx !== -1) {
          data.exchangeWallets[pWIdx].balance =
            Math.max(0, parseFloat(principalWallet.balance || '0') - stake.amount).toString();
        }

        // Send pending rewards if any and different wallet
        if (pendingRewards > 0.0001 && rewardWallet && rewardWallet.id !== principalWallet.id) {
          const rTok = rewardWallet.tokenId
            ? tokens.find((t: any) => t.id === rewardWallet.tokenId)
            : null;
          const txR = await tatum.sendFromExchangeWallet({
            chain:           rewardWallet.chain,
            fromPrivateKey:  rewardWallet.privateKey,
            toAddress:       stake.userAddress,
            amount:          pendingRewards.toFixed(6),
            contractAddress: rTok?.contractAddress,
            tokenDecimals:   rTok?.decimals || 18,
          });
          rewardTx = txR.txId;

          const rWIdx = data.exchangeWallets.findIndex((w: any) => w.id === rewardWallet.id);
          if (rWIdx !== -1) {
            data.exchangeWallets[rWIdx].balance =
              Math.max(0, parseFloat(rewardWallet.balance || '0') - pendingRewards).toString();
          }
        }
      } catch (e: any) {
        return res.status(500).json({ error: `Unstake payout failed: ${e.message}` });
      }
    }

    // Mark stake as unstaked
    const sIdx = data.userStakes.findIndex((s: any) => s.id === stakeId);
    if (sIdx !== -1) {
      data.userStakes[sIdx].status      = 'unstaked';
      data.userStakes[sIdx].unstakedAt  = new Date().toISOString();
      data.userStakes[sIdx].unstakeTxId = principalTx;
    }

    // Update pool TVL
    const pIdx = data.localStakingPools.findIndex((p: any) => p.id === stake.poolId);
    if (pIdx !== -1) {
      data.localStakingPools[pIdx].totalStaked =
        Math.max(0, (data.localStakingPools[pIdx].totalStaked || 0) - stake.amount);
    }

    // Record payout
    if (!Array.isArray(data.stakingPayouts)) data.stakingPayouts = [];
    data.stakingPayouts.unshift({
      id:             `payout-${Date.now()}`,
      type:           'unstake',
      stakeId,
      poolId:         stake.poolId,
      poolName:       pool.name,
      principalAmount: stake.amount,
      rewardAmount:   pendingRewards,
      symbol:         pool.tokenSymbol,
      rewardSymbol:   pool.rewardSymbol,
      userAddress:    stake.userAddress,
      principalTxId:  principalTx,
      rewardTxId:     rewardTx,
      status:         principalTx ? 'sent' : 'pending',
      timestamp:      new Date().toISOString(),
    });

    writeData(data);

    return res.status(200).json({
      success:      true,
      principalTx,
      rewardTx,
      principal:    stake.amount,
      rewards:      pendingRewards,
      pending:      !principalTx,
      message:      principalTx
        ? `Unstaked! ${stake.amount} ${pool.tokenSymbol} + ${pendingRewards.toFixed(6)} ${pool.rewardSymbol} rewards sent to your wallet.`
        : `Unstake recorded (Tatum not configured — pending manual payout).`,
    });
  }

  /* ── Admin-only actions ─────────────────────────────────────────────────── */
  if (!auth(req)) return res.status(401).json({ error: 'Unauthorized' });

  // Create pool
  if (req.method === 'POST' && action === 'create-pool') {
    const {
      name, tokenSymbol, rewardSymbol, aprPercent,
      lockDays, minStake, minClaimAmount, enabled,
      description, rewardWalletId,
    } = req.body;

    if (!name || !tokenSymbol || !rewardSymbol || aprPercent === undefined) {
      return res.status(400).json({ error: 'name, tokenSymbol, rewardSymbol, aprPercent required' });
    }

    if (!Array.isArray(data.localStakingPools)) data.localStakingPools = [];

    const newPool = {
      id:              `pool-${Date.now()}`,
      name,
      tokenSymbol:     tokenSymbol.toUpperCase(),
      rewardSymbol:    rewardSymbol.toUpperCase(),
      aprPercent:      parseFloat(aprPercent),
      lockDays:        parseInt(lockDays) || 0,
      minStake:        parseFloat(minStake) || 0,
      minClaimAmount:  parseFloat(minClaimAmount) || 0.0001,
      description:     description || '',
      rewardWalletId:  rewardWalletId || null,
      enabled:         enabled !== false,
      totalStaked:     0,
      createdAt:       new Date().toISOString(),
    };

    data.localStakingPools.push(newPool);
    writeData(data);
    return res.status(201).json({ success: true, pool: newPool });
  }

  // Update pool
  if (req.method === 'PUT' && action === 'update-pool') {
    const { id, ...updates } = req.body;
    if (!id) return res.status(400).json({ error: 'id required' });
    const idx = (data.localStakingPools || []).findIndex((p: any) => p.id === id);
    if (idx === -1) return res.status(404).json({ error: 'Pool not found' });
    data.localStakingPools[idx] = { ...data.localStakingPools[idx], ...updates };
    writeData(data);
    return res.status(200).json({ success: true, pool: data.localStakingPools[idx] });
  }

  // Delete pool
  if (req.method === 'DELETE' && action === 'delete-pool') {
    const { id } = req.query;
    data.localStakingPools = (data.localStakingPools || []).filter((p: any) => p.id !== id);
    writeData(data);
    return res.status(200).json({ success: true });
  }

  // Get all stakes (admin view)
  if (req.method === 'GET' && action === 'all-stakes') {
    return res.status(200).json({
      stakes:   data.userStakes || [],
      payouts:  data.stakingPayouts || [],
    });
  }

  // Manual payout (admin triggers payout for a stake)
  if (req.method === 'POST' && action === 'manual-payout') {
    const { stakeId } = req.body;
    // Re-use claim logic by calling the API internally
    req.query.action = 'claim';
    return handler(req, res);
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
