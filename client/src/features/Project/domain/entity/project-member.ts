import Role from './enum/role.ts';

class ProjectMember {
  constructor(
    public projectId: number,
    public email: string,
    public name: string,
    public role: Role
  ) {}
}

export default ProjectMember;
