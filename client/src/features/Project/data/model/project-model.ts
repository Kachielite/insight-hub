import ProjectMemberModel from '@/features/Project/data/model/project-member-model.ts';
import ProjectMember from '@/features/Project/domain/entity/project-member.ts';
import Project from '@/features/Project/domain/entity/project.ts';

class ProjectModel extends Project {
  constructor(
    public id: string,
    public name: string,
    public createdAt: string,
    public members?: ProjectMember[]
  ) {
    super(id, name, createdAt, members);
  }

  static fromJson(json: any): ProjectModel {
    const members: ProjectMemberModel[] = json.members
      ? json.members.map((member: ProjectMemberModel) =>
          ProjectMemberModel.fromJson(member)
        )
      : [];
    return new ProjectModel(json.id, json.name, json.createdAt, members);
  }
}

export default ProjectModel;
