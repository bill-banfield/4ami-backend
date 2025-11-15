import { DataSource } from 'typeorm';
import { ProjectType } from '../entities/project-type.entity';

export async function seedProjectTypes(dataSource: DataSource) {
  const projectTypeRepository = dataSource.getRepository(ProjectType);

  const projectTypes = [
    {
      code: 'residual_analysis',
      name: 'Residual Analysis',
      description:
        'Asset residual value analysis project for equipment evaluation',
      isActive: true,
    },
    // Add more project types here in the future
    // {
    //   code: 'feasibility_study',
    //   name: 'Feasibility Study',
    //   description: 'Project feasibility analysis',
    //   isActive: true,
    // },
  ];

  for (const type of projectTypes) {
    const existing = await projectTypeRepository.findOne({
      where: { code: type.code },
    });

    if (!existing) {
      const projectType = projectTypeRepository.create(type);
      await projectTypeRepository.save(projectType);
      console.log(`✓ Created project type: ${type.name}`);
    } else {
      console.log(`→ Project type already exists: ${type.name}`);
    }
  }
}
