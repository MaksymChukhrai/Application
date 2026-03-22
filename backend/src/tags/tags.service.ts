import { Injectable, ConflictException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Repository } from 'typeorm';
import { Tag } from './tag.entity';
import { CreateTagDto } from './dto/create-tag.dto';

@Injectable()
export class TagsService {
  constructor(
    @InjectRepository(Tag)
    private readonly tagRepository: Repository<Tag>,
  ) {}

  async findAll(): Promise<Tag[]> {
    return this.tagRepository.find({ order: { name: 'ASC' } });
  }

  async findByIds(ids: string[]): Promise<Tag[]> {
    if (!ids || ids.length === 0) return [];
    return this.tagRepository.findBy({ id: In(ids) });
  }

  async create(dto: CreateTagDto): Promise<Tag> {
    const normalized = dto.name.trim().toLowerCase();

    const existing = await this.tagRepository.findOne({
      where: { name: normalized },
    });

    if (existing) {
      throw new ConflictException(`Tag with name "${dto.name}" already exists`);
    }

    const tag = this.tagRepository.create({ name: normalized });
    return this.tagRepository.save(tag);
  }

  async findOrCreate(name: string): Promise<Tag> {
    const normalized = name.trim().toLowerCase();
    const existing = await this.tagRepository.findOne({
      where: { name: normalized },
    });
    if (existing) return existing;

    const tag = this.tagRepository.create({ name: normalized });
    return this.tagRepository.save(tag);
  }
}
