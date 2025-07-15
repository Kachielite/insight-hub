import { Role } from '@prisma';

class ProjectMemberDTO {
  public projectId: number;
  public email: string;
  public name: string;
  public role: Role;

  constructor(projectId: number, email: string, name: string, role: Role) {
    this.projectId = projectId;
    this.email = email;
    this.name = name;
    this.role = role;
  }
}

export default ProjectMemberDTO;
