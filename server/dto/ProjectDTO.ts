import { ProjectMemberDTO } from '@dto/ProjectMemberDTO';

class ProjectDTO {
  public id: number;
  public name: string;
  public createdAt: string;
  public members?: ProjectMemberDTO[];

  constructor(
    id: number,
    name: string,
    createdAt: string,
    members?: ProjectMemberDTO[]
  ) {
    this.id = id;
    this.name = name;
    this.createdAt = createdAt;
    this.members = members;
  }
}

export default ProjectDTO;
