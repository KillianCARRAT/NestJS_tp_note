import { IsString, IsNotEmpty, IsBoolean, IsOptional } from 'class-validator';

export class MatchResultDto {
  @IsString()
  @IsNotEmpty()
  winnerId: string;

  @IsString()
  @IsNotEmpty()
  loserId: string;

  @IsBoolean()
  @IsOptional()
  isDraw?: boolean;
}
