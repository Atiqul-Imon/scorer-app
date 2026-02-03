'use client';

import Card from '@/components/ui/Card';
import { Target } from 'lucide-react';

interface Bowler {
  id: string;
  name: string;
  overs: number;
  balls: number;
  runs: number;
  wickets: number;
  economy: number;
}

interface CurrentBowlerCardProps {
  bowler: Bowler | null;
  bowlerId: string;
}

export default function CurrentBowlerCard({ bowler, bowlerId }: CurrentBowlerCardProps) {
  if (!bowler) {
    return null;
  }

  const formatOvers = (overs: number, balls: number) => {
    const totalBalls = overs * 6 + (balls || 0);
    const fullOvers = Math.floor(totalBalls / 6);
    const remainingBalls = totalBalls % 6;
    return `${fullOvers}.${remainingBalls}`;
  };

  return (
    <Card className="p-4 bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200">
      <div className="flex items-center gap-2 mb-3">
        <Target className="w-4 h-4 text-blue-700" />
        <h3 className="text-sm font-semibold text-gray-900">Current Bowler</h3>
      </div>
      
      <div className="p-3 bg-white rounded-lg border border-blue-200">
        <p className="text-sm font-semibold text-gray-900 mb-2">{bowler.name}</p>
        <div className="flex items-center gap-4 text-xs text-gray-600">
          <span className="font-medium text-gray-900">
            {formatOvers(bowler.overs, bowler.balls)}-{bowler.runs}-{bowler.wickets}
          </span>
          <span className="font-semibold">
            Economy: {bowler.economy.toFixed(2)}
          </span>
        </div>
      </div>
    </Card>
  );
}




