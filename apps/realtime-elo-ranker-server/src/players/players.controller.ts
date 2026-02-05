import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
} from '@nestjs/common';
import { PlayersService } from './players.service';
import { Player } from './player.entity';

@Controller('players')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Get()
  getAllPlayers(): Promise<Player[]> {
    return this.playersService.findAll();
  }

  @Get(':id')
  getPlayer(@Param('id') id: string): Promise<Player> {
    return this.playersService.findOne(id);
  }

  @Post()
  createPlayer(
    @Body() body: { name: string; initialElo?: number },
  ): Promise<Player> {
    return this.playersService.create(body.name, body.initialElo);
  }

  @Put(':id')
  updatePlayer(
    @Param('id') id: string,
    @Body() updateData: Partial<Player>,
  ): Promise<Player> {
    return this.playersService.update(id, updateData);
  }

  @Delete(':id')
  deletePlayer(@Param('id') id: string): Promise<void> {
    return this.playersService.delete(id);
  }

  @Get('ranking/all')
  getRanking(): Promise<Player[]> {
    return this.playersService.getRanking();
  }
}
