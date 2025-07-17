import Role from '@/features/Project/domain/entity/enum/role.ts';
import ProjectMember from '@/features/Project/domain/entity/project-member.ts';

class ProjectMemberModel extends ProjectMember {
  constructor(
    public projectId: number,
    public email: string,
    public name: string,
    public role: Role
  ) {
    super(projectId, email, name, role);
  }

  static fromJson(json: any): ProjectMemberModel {
    return new ProjectMemberModel(
      json.projectId,
      json.email,
      json.name,
      json.role
    );
  }
}

export default ProjectMemberModel;
