import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PlayersService } from '../players/players.service';
import { EloService } from './elo.service';
import {
  EventsService,
  MatchRecordedEvent,
  RankingUpdatedEvent,
} from '../events/events.service';
import { Player } from '../players/player.entity';

export interface MatchResult {
  winnerId: string;
  loserId: string;
  isDraw?: boolean;
}

export interface UpdatedRanking {
  winner: Player;
  loser: Player;
  eloChanges: {
    winner: number;
    loser: number;
  };
}

@Injectable()
export class RankingService {
  constructor(
    private readonly playersService: PlayersService,
    private readonly eloService: EloService,
    private readonly eventsService: EventsService,
  ) {}

  async recordMatch(matchResult: MatchResult): Promise<UpdatedRanking> {
    const { winnerId, loserId, isDraw = false } = matchResult;

    if (winnerId === loserId) {
      throw new BadRequestException(
        'Un joueur ne peut pas jouer contre lui-même',
      );
    }

    const winner = await this.playersService.findOne(winnerId);
    const loser = await this.playersService.findOne(loserId);

    if (!winner || !loser) {
      throw new NotFoundException('Un ou plusieurs joueurs introuvables');
    }

    const winnerOldElo = winner.elo;
    const loserOldElo = loser.elo;

    const { winnerNewElo, loserNewElo } = this.eloService.calculateMatchResults(
      winner.elo,
      loser.elo,
      isDraw,
    );

    const eloChanges = {
      winner: winnerNewElo - winner.elo,
      loser: loserNewElo - loser.elo,
    };

    const updatedWinner = await this.playersService.updateElo(
      winnerId,
      winnerNewElo,
      !isDraw,
    );

    const updatedLoser = await this.playersService.updateElo(
      loserId,
      loserNewElo,
      false,
    );

    const matchEvent: MatchRecordedEvent = {
      winner: {
        id: updatedWinner.id,
        name: updatedWinner.name,
        oldElo: winnerOldElo,
        newElo: updatedWinner.elo,
        eloChange: eloChanges.winner,
      },
      loser: {
        id: updatedLoser.id,
        name: updatedLoser.name,
        oldElo: loserOldElo,
        newElo: updatedLoser.elo,
        eloChange: eloChanges.loser,
      },
      isDraw,
      timestamp: new Date(),
    };
    this.eventsService.emitMatchRecorded(matchEvent);

    const ranking = await this.getRankingWithPositions();
    const rankingEvent: RankingUpdatedEvent = {
      topPlayers: ranking.slice(0, 10).map((p) => ({
        id: p.id,
        name: p.name,
        elo: p.elo,
        rank: p.rank,
      })),
      timestamp: new Date(),
    };
    this.eventsService.emitRankingUpdated(rankingEvent);

    return {
      winner: updatedWinner,
      loser: updatedLoser,
      eloChanges,
    };
  }

  async getRanking(): Promise<Player[]> {
    return await this.playersService.getRanking();
  }

  async getRankingWithPositions(): Promise<Array<Player & { rank: number }>> {
    const players = await this.getRanking();

    return players.map((player, index) => ({
      ...player,
      rank: index + 1,
    }));
  }

  async getTopPlayers(limit: number = 10): Promise<Player[]> {
    const ranking = await this.getRanking();
    return ranking.slice(0, limit);
  }

  async getPlayerRank(playerId: string): Promise<number> {
    const ranking = await this.getRanking();
    const position = ranking.findIndex((player) => player.id === playerId);

    if (position === -1) {
      throw new NotFoundException('Joueur introuvable dans le classement');
    }

    return position + 1;
  }

  async estimateMatchOutcome(player1Id: string, player2Id: string) {
    const player1 = await this.playersService.findOne(player1Id);
    const player2 = await this.playersService.findOne(player2Id);

    const player1Changes = this.eloService.estimateEloChange(
      player1.elo,
      player2.elo,
    );
    const player2Changes = this.eloService.estimateEloChange(
      player2.elo,
      player1.elo,
    );

    return {
      player1: {
        ...player1,
        potentialChanges: player1Changes,
      },
      player2: {
        ...player2,
        potentialChanges: player2Changes,
      },
    };
  }

  async resetPlayerElo(
    playerId: string,
    newElo: number = 1000,
  ): Promise<Player> {
    return await this.playersService.update(playerId, {
      elo: newElo,
      wins: 0,
      losses: 0,
    });
  }
}
