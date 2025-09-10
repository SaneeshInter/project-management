import { Module } from '@nestjs/common';
import { ProjectsService } from './projects.service';
import { ProjectsController } from './projects.controller';
import { WorkflowRulesService } from './services/workflow-rules.service';
import { WorkflowValidatorService } from './services/workflow-validator.service';
import { CategoriesModule } from '../categories/categories.module';

@Module({
  imports: [CategoriesModule],
  controllers: [ProjectsController],
  providers: [ProjectsService, WorkflowRulesService, WorkflowValidatorService],
  exports: [ProjectsService],
})
export class ProjectsModule {}