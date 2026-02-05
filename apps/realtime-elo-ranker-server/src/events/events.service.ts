import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

export enum RankingEvent {
  MATCH_RECORDED = 'ranking.match.recorded',
  PLAYER_CREATED = 'ranking.player.created',
  PLAYER_UPDATED = 'ranking.player.updated',
  PLAYER_DELETED = 'ranking.player.deleted',
  RANKING_UPDATED = 'ranking.updated',
}

export interface MatchRecordedEvent {
  matchId?: string;
  winner: {
    id: string;
    name: string;
    oldElo: number;
    newElo: number;
    eloChange: number;
  };
  loser: {
    id: string;
    name: string;
    oldElo: number;
    newElo: number;
    eloChange: number;
  };
  isDraw: boolean;
  timestamp: Date;
}

export interface PlayerCreatedEvent {
  player: {
    id: string;
    name: string;
    elo: number;
  };
  timestamp: Date;
}

export interface PlayerUpdatedEvent {
  player: {
    id: string;
    name: string;
    elo: number;
  };
  timestamp: Date;
}

export interface PlayerDeletedEvent {
  playerId: string;
  playerName: string;
  timestamp: Date;
}

export interface RankingUpdatedEvent {
  topPlayers: Array<{
    id: string;
    name: string;
    elo: number;
    rank: number;
  }>;
  timestamp: Date;
}

@Injectable()
export class EventsService {
  constructor(private eventEmitter: EventEmitter2) {}

  emitMatchRecorded(event: MatchRecordedEvent) {
    this.eventEmitter.emit(RankingEvent.MATCH_RECORDED, event);
  }

  emitPlayerCreated(event: PlayerCreatedEvent) {
    this.eventEmitter.emit(RankingEvent.PLAYER_CREATED, event);
  }

  emitPlayerUpdated(event: PlayerUpdatedEvent) {
    this.eventEmitter.emit(RankingEvent.PLAYER_UPDATED, event);
  }

  emitPlayerDeleted(event: PlayerDeletedEvent) {
    this.eventEmitter.emit(RankingEvent.PLAYER_DELETED, event);
  }

  emitRankingUpdated(event: RankingUpdatedEvent) {
    this.eventEmitter.emit(RankingEvent.RANKING_UPDATED, event);
  }
}