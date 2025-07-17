import Role from '@/core/common/domain/entity/enum/role.ts';
import ProjectModel from '@/features/Project/data/model/project-model';
import User from '@/features/User/domain/entity/user.ts';

class UserModel extends User {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public role: Role,
    public createdAt: Date,
    public projects?: ProjectModel[]
  ) {
    super(id, name, email, role, createdAt, projects);
  }

  static fromJson(json: any): UserModel {
    const projects = json.projects
      ? json.projects.map((project: any) => ProjectModel.fromJson(project))
      : [];
    return new UserModel(
      json.id,
      json.name,
      json.email,
      json.role,
      json.createdAt,
      projects
    );
  }
}

export default UserModel;
