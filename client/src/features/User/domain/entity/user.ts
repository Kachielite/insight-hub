import Role from '@/core/common/domain/entity/enum/role.ts';
import Project from '@/features/Project/domain/entity/project.ts';

class User {
  constructor(
    public id: number,
    public name: string,
    public email: string,
    public role: Role,
    public createdAt: Date,
    public projects?: Project[]
  ) {}
}

export default User;
