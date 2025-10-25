import { useState, useEffect } from 'react';
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi';
import { formatEther, parseEther } from 'viem';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { contractAddress, contractABI } from '@/utils/evmConfig';
import { format } from 'date-fns';
import { Loader2, TrendingUp, Clock, Users } from 'lucide-react';

interface Bet {
  id: number;
  creator: string;
  title: string;
  description: string;
  outcomes: string[];
  investmentDeadline: bigint;
  settlementDeadline: bigint;
  irysTxId: string;
  settled: boolean;
  winningOutcomeIndex: bigint;
}

export default function BetsList() {
  const { address, isConnected } = useAccount();
  const [selectedBet, setSelectedBet] = useState<number | null>(null);
  const [selectedOutcome, setSelectedOutcome] = useState<number>(0);
  const [investAmount, setInvestAmount] = useState('');

  const { writeContract, data: hash, isPending, error } = useWriteContract();
  const { isLoading: isConfirming, isSuccess } = useWaitForTransactionReceipt({ hash });

  // Read next bet ID to know how many bets exist
  const { data: nextBetId } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'nextBetId',
  });

  const totalBets = nextBetId ? Number(nextBetId) : 0;

  const handleInvest = () => {
    if (!isConnected || selectedBet === null) return;

    writeContract({
      address: contractAddress,
      abi: contractABI,
      functionName: 'invest',
      args: [BigInt(selectedBet), BigInt(selectedOutcome)],
      value: parseEther(investAmount),
    });
  };

  if (isSuccess) {
    setTimeout(() => {
      window.location.reload();
    }, 2000);
  }

  return (
    <div className="space-y-6">
      {totalBets === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <TrendingUp className="w-12 h-12 mx-auto text-gray-400 mb-4" />
            <h3 className="font-heading font-semibold text-xl mb-2">No Bets Yet</h3>
            <p className="text-gray-600 mb-4">Be the first to create a bet!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6">
          {Array.from({ length: totalBets }, (_, i) => (
            <BetCard
              key={i}
              betId={i}
              onInvest={(outcomeIndex) => {
                setSelectedBet(i);
                setSelectedOutcome(outcomeIndex);
              }}
              selectedBet={selectedBet}
              selectedOutcome={selectedOutcome}
              investAmount={investAmount}
              setInvestAmount={setInvestAmount}
              handleInvest={handleInvest}
              isPending={isPending}
              isConfirming={isConfirming}
              error={error}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function BetCard({
  betId,
  onInvest,
  selectedBet,
  selectedOutcome,
  investAmount,
  setInvestAmount,
  handleInvest,
  isPending,
  isConfirming,
  error,
}: any) {
  const { address, isConnected } = useAccount();

  const { data: betData } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getBet',
    args: [BigInt(betId)],
  });

  if (!betData) return null;

  const [
    creator,
    title,
    description,
    outcomes,
    investmentDeadline,
    settlementDeadline,
    irysTxId,
    settled,
    winningOutcomeIndex,
  ] = betData as any;

  const now = Math.floor(Date.now() / 1000);
  const investmentDeadlineSec = Number(investmentDeadline);
  const settlementDeadlineSec = Number(settlementDeadline);
  const canInvest = now < investmentDeadlineSec && !settled;

  return (
    <Card className="overflow-hidden">
function OutcomeCard({
  betId,
  outcomeIndex,
  outcomeName,
  isWinner,
  canInvest,
  onInvest,
  isSelected,
}: any) {
  const { data: poolData } = useReadContract({
    address: contractAddress,
    abi: contractABI,
    functionName: 'getOutcomePool',
    args: [BigInt(betId), BigInt(outcomeIndex)],
  });

  const pool = poolData ? formatEther(poolData as bigint) : '0';

  return (
    <div
      className={`border rounded-lg p-3 transition-all ${
        isSelected ? 'border-primary bg-primary/5' : 'border-gray-200'
      } ${isWinner ? 'bg-green-50 border-green-500' : ''}`}
    >
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-medium">{outcomeName}</span>
          {isWinner && <Badge className="bg-green-600 text-xs">Winner</Badge>}
        </div>
        <span className="text-sm font-semibold">{parseFloat(pool).toFixed(4)} ETH</span>
      </div>

      {canInvest && (
        <Button
          variant={isSelected ? 'default' : 'outline'}
          size="sm"
          onClick={onInvest}
          className="w-full font-heading"
        >
          {isSelected ? 'Selected' : 'Invest in this outcome'}
        </Button>
      )}
    </div>
  );
}
