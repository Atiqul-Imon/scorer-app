'use client';

import { memo, useMemo } from 'react';
import Card from '@/components/ui/Card';
import { Users } from 'lucide-react';

interface PartnershipCardProps {
  runs: number;
  balls: number;
}

function PartnershipCard({ runs, balls }: PartnershipCardProps) {
  const { overs, remainingBalls } = useMemo(() => {
    const overs = Math.floor(balls / 6);
    const remainingBalls = balls % 6;
    return { overs, remainingBalls };
  }, [balls]);

  return (
    <Card className="p-4 lg:p-6 bg-gradient-to-br from-purple-500/10 to-gray-800 border-purple-500/20">
      <div className="flex items-center gap-2 mb-2 lg:mb-3">
        <Users className="w-4 h-4 lg:w-5 lg:h-5 text-purple-400" />
        <h3 className="text-sm lg:text-base font-semibold text-gray-100">Partnership</h3>
      </div>
      
      <div className="text-center">
        <p className="text-2xl lg:text-3xl font-bold text-gray-100 mb-1 lg:mb-2">
          {runs} <span className="text-lg lg:text-xl text-gray-400">runs</span>
        </p>
        <p className="text-xs lg:text-sm text-gray-400">
          {balls} balls ({overs}.{remainingBalls} overs)
        </p>
      </div>
    </Card>
  );
}

export default memo(PartnershipCard);




