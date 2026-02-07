import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './player.entity';
import {
  EventsService,
  PlayerCreatedEvent,
  PlayerUpdatedEvent,
  PlayerDeletedEvent,
} from '../events/events.service';
import { RankingCacheService } from '../ranking/cache/ranking-cache.service';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    private readonly eventsService: EventsService,
    private readonly rankingCacheService: RankingCacheService,
  ) {}

  async create(name: string, initialElo: number = 1000): Promise<Player> {
    const existingPlayer = await this.playerRepository.findOne({
      where: { name },
    });

    if (existingPlayer) {
      throw new ConflictException(`Le joueur ${name} existe déjà`);
    }

    const player = this.playerRepository.create({
      name,
      elo: initialElo,
      wins: 0,
      losses: 0,
    });

    const savedPlayer = await this.playerRepository.save(player);

    const event: PlayerCreatedEvent = {
      player: {
        id: savedPlayer.id,
        name: savedPlayer.name,
        elo: savedPlayer.elo,
      },
      timestamp: new Date(),
    };
    this.eventsService.emitPlayerCreated(event);
    this.rankingCacheService.upsert({
      playerId: savedPlayer.id,
      elo: savedPlayer.elo,
    });

    return savedPlayer;
  }

  async findAll(): Promise<Player[]> {
    return await this.playerRepository.find({
      order: { elo: 'DESC' },
    });
  }

  async findOne(id: string): Promise<Player> {
    const player = await this.playerRepository.findOne({ where: { id } });

    if (!player) {
      throw new NotFoundException(`Joueur avec l'ID ${id} introuvable`);
    }

    return player;
  }

  async findByName(name: string): Promise<Player | null> {
    return await this.playerRepository.findOne({ where: { name } });
  }

  async updateElo(id: string, newElo: number, won: boolean): Promise<Player> {
    const player = await this.findOne(id);

    player.elo = Math.round(newElo);
    player.updatedAt = new Date();

    if (won) {
      player.wins += 1;
    } else {
      player.losses += 1;
    }

    const updatedPlayer = await this.playerRepository.save(player);

    const event: PlayerUpdatedEvent = {
      player: {
        id: updatedPlayer.id,
        name: updatedPlayer.name,
        elo: updatedPlayer.elo,
      },
      timestamp: new Date(),
    };
    this.eventsService.emitPlayerUpdated(event);
    this.rankingCacheService.upsert({
      playerId: updatedPlayer.id,
      elo: updatedPlayer.elo,
    });

    return updatedPlayer;
  }

  async update(id: string, updateData: Partial<Player>): Promise<Player> {
    const player = await this.findOne(id);

    Object.assign(player, updateData);
    player.updatedAt = new Date();

    const updatedPlayer = await this.playerRepository.save(player);

    const event: PlayerUpdatedEvent = {
      player: {
        id: updatedPlayer.id,
        name: updatedPlayer.name,
        elo: updatedPlayer.elo,
      },
      timestamp: new Date(),
    };
    this.eventsService.emitPlayerUpdated(event);
    this.rankingCacheService.upsert({
      playerId: updatedPlayer.id,
      elo: updatedPlayer.elo,
    });

    return updatedPlayer;
  }

  async delete(id: string): Promise<void> {
    const player = await this.findOne(id);

    const event: PlayerDeletedEvent = {
      playerId: player.id,
      playerName: player.name,
      timestamp: new Date(),
    };
    this.eventsService.emitPlayerDeleted(event);
    this.rankingCacheService.remove(player.id);

    await this.playerRepository.remove(player);
  }

  async getRanking(): Promise<Player[]> {
    return await this.playerRepository.find({
      order: {
        elo: 'DESC',
        wins: 'DESC',
      },
    });
  }

  async count(): Promise<number> {
    return await this.playerRepository.count();
  }
}
