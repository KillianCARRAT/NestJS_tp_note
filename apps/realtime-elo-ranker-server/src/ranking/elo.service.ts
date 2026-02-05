import { Injectable } from '@nestjs/common';

@Injectable()
export class EloService {
  private readonly K_FACTOR = 32;

  private calculateExpectedScore(eloA: number, eloB: number): number {
    return 1 / (1 + Math.pow(10, (eloB - eloA) / 400));
  }

  calculateNewElo(
    currentElo: number,
    opponentElo: number,
    actualScore: number,
  ): number {
    const expectedScore = this.calculateExpectedScore(currentElo, opponentElo);
    const newElo = currentElo + this.K_FACTOR * (actualScore - expectedScore);

    return Math.round(newElo);
  }

  calculateMatchResults(
    winnerElo: number,
    loserElo: number,
    isDraw: boolean = false,
  ): { winnerNewElo: number; loserNewElo: number } {
    if (isDraw) {
      return {
        winnerNewElo: this.calculateNewElo(winnerElo, loserElo, 0.5),
        loserNewElo: this.calculateNewElo(loserElo, winnerElo, 0.5),
      };
    }

    return {
      winnerNewElo: this.calculateNewElo(winnerElo, loserElo, 1),
      loserNewElo: this.calculateNewElo(loserElo, winnerElo, 0),
    };
  }

  estimateEloChange(
    playerElo: number,
    opponentElo: number,
  ): {
    ifWin: number;
    ifLose: number;
    ifDraw: number;
  } {
    return {
      ifWin: this.calculateNewElo(playerElo, opponentElo, 1) - playerElo,
      ifLose: this.calculateNewElo(playerElo, opponentElo, 0) - playerElo,
      ifDraw: this.calculateNewElo(playerElo, opponentElo, 0.5) - playerElo,
    };
  }
}
