import { Injectable } from '@nestjs/common';

export interface PlayerRanking {
  playerId: string;
  elo: number;
  rank: number;
}

@Injectable()
export class RankingCacheService {
  private readonly rankings = new Map<string, PlayerRanking>();

  getAll(): PlayerRanking[] {
    return Array.from(this.rankings.values());
  }

  get(playerId: string): PlayerRanking | undefined {
    return this.rankings.get(playerId);
  }

  upsert(player: Omit<PlayerRanking, 'rank'>): void {
    this.rankings.set(player.playerId, {
      ...player,
      rank: 0,
    });

    this.recalculateRanks();
  }

  remove(playerId: string): void {
    this.rankings.delete(playerId);
    this.recalculateRanks();
  }

  clear(): void {
    this.rankings.clear();
  }

  private recalculateRanks(): void {
    const sorted = Array.from(this.rankings.values()).sort(
      (a, b) => b.elo - a.elo,
    );

    sorted.forEach((player, index) => {
      player.rank = index + 1;
    });
  }
}
