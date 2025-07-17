import ProjectMember from './project-member';

class Project {
  constructor(
    public id: string,
    public name: string,
    public createdAt: string,
    public members?: ProjectMember[]
  ) {}
}

export default Project;
