import ProjectMemberDTO from '@dto/ProjectMemberDTO';

class ProjectDTO {
  public id: number;
  public name: string;
  public members?: ProjectMemberDTO[];

  constructor(id: number, name: string, members?: ProjectMemberDTO[]) {
    this.id = id;
    this.name = name;
    this.members = members;
  }
}

export default ProjectDTO;
