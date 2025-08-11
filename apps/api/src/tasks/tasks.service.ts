import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Task } from "./entities/task.entity";
import { Repository } from "typeorm";
import { CreateTaskDto } from "./dtos/create-task.dto";
import { UpdateTaskDto } from "./dtos/update-task.dto";
import { TaskStatus } from "./enums/task-status.enum";

@Injectable()
export class TasksService {
  // -----------------------------------------------------------------------------------------------
  constructor(@InjectRepository(Task) private repo: Repository<Task>) {}

  // -----------------------------------------------------------------------------------------------
  // Create a task
  async create(data: CreateTaskDto) {
    const t = this.repo.create({
      ...data,
      status: TaskStatus.PENDING,
    });

    return this.repo.save(t);
  }

  // -----------------------------------------------------------------------------------------------
  // List tasks by org
  async listByOrg(orgId: string) {
    return this.repo.find({ where: { orgId }, order: { createdAt: "DESC" } });
  }

  // -----------------------------------------------------------------------------------------------
  // Find task by id
  async findById(id: string) {
    return this.repo.findOne({ where: { id } });
  }

  // -----------------------------------------------------------------------------------------------
  // Update a task
  async update(id: string, data: UpdateTaskDto) {
    const t = await this.findById(id);
    if (!t) throw new NotFoundException("Task not found");

    Object.assign(t, data);

    return this.repo.save(t);
  }

  // -----------------------------------------------------------------------------------------------
  // Remove a task
  async remove(id: string) {
    const t = await this.findById(id);
    if (!t) throw new NotFoundException("Task not found");

    await this.repo.remove(t);

    return t;
  }

  // -----------------------------------------------------------------------------------------------
}
