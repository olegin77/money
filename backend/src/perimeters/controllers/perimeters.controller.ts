import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Throttle } from '@nestjs/throttler';
import { PerimetersService } from '../services/perimeters.service';
import { CreatePerimeterDto } from '../dto/create-perimeter.dto';
import { UpdatePerimeterDto } from '../dto/update-perimeter.dto';
import { SharePerimeterDto } from '../dto/share-perimeter.dto';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../../auth/decorators/current-user.decorator';

@ApiTags('Perimeters')
@Controller('perimeters')
@UseGuards(JwtAuthGuard)
export class PerimetersController {
  constructor(private readonly perimetersService: PerimetersService) {}

  @Post()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @HttpCode(HttpStatus.CREATED)
  async create(
    @CurrentUser() user: CurrentUserData,
    @Body() createPerimeterDto: CreatePerimeterDto
  ) {
    const perimeter = await this.perimetersService.create(user.id, createPerimeterDto);

    return {
      success: true,
      message: 'Perimeter created successfully',
      data: perimeter,
    };
  }

  @Get()
  async findAll(@CurrentUser() user: CurrentUserData) {
    const perimeters = await this.perimetersService.findAll(user.id);

    return {
      success: true,
      data: perimeters,
    };
  }

  @Get(':id')
  async findOne(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    const perimeter = await this.perimetersService.findOne(id, user.id);

    return {
      success: true,
      data: perimeter,
    };
  }

  @Get(':id/feed')
  async getPerimeterFeed(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string
  ) {
    const result = await this.perimetersService.getPerimeterFeed(
      id,
      user.id,
      page ? parseInt(page, 10) : 1,
      limit ? Math.min(parseInt(limit, 10), 100) : 20
    );

    return {
      success: true,
      data: result,
    };
  }

  @Patch(':id')
  async update(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() updatePerimeterDto: UpdatePerimeterDto
  ) {
    const perimeter = await this.perimetersService.update(id, user.id, updatePerimeterDto);

    return {
      success: true,
      message: 'Perimeter updated successfully',
      data: perimeter,
    };
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  async remove(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    await this.perimetersService.remove(id, user.id);

    return {
      success: true,
      message: 'Perimeter deleted successfully',
    };
  }

  @Post(':id/share')
  @HttpCode(HttpStatus.CREATED)
  async share(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Body() sharePerimeterDto: SharePerimeterDto
  ) {
    const share = await this.perimetersService.share(id, user.id, sharePerimeterDto);

    return {
      success: true,
      message: 'Perimeter shared successfully',
      data: share,
    };
  }

  @Delete(':id/share/:userId')
  @HttpCode(HttpStatus.OK)
  async unshare(
    @CurrentUser() user: CurrentUserData,
    @Param('id') id: string,
    @Param('userId') userId: string
  ) {
    await this.perimetersService.unshare(id, user.id, userId);

    return {
      success: true,
      message: 'Perimeter unshared successfully',
    };
  }

  @Get(':id/shares')
  async getShares(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    const shares = await this.perimetersService.getShares(id, user.id);

    return {
      success: true,
      data: shares,
    };
  }

  @Get(':id/budget-status')
  async getBudgetStatus(@CurrentUser() user: CurrentUserData, @Param('id') id: string) {
    const status = await this.perimetersService.getBudgetStatus(id, user.id);

    return {
      success: true,
      data: status,
    };
  }
}
