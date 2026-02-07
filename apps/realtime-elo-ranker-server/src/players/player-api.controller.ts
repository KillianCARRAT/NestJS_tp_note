import { BadRequestException, Body, Controller, Post } from '@nestjs/common';
import { PlayersService } from './players.service';

@Controller('player')
export class PlayerApiController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  async createPlayer(@Body() body: { id?: string }) {
    const id = body?.id?.trim();

    if (!id) {
      throw new BadRequestException("L'identifiant du joueur n'est pas valide");
    }

    const player = await this.playersService.create(id);

    return {
      id: player.name,
      rank: player.elo,
    };
  }
}
