import GeneralResponseDTO from '@dto/GeneralResponseDTO';
import { UserResponseDTO, UserUpdateDTO } from '@dto/UserDTO';

export interface IUserService {
  findUserById(id: number): Promise<GeneralResponseDTO<UserResponseDTO>>;
  updateUser(
    userData: UserUpdateDTO
  ): Promise<GeneralResponseDTO<UserResponseDTO>>;
  deleteUser(id: number): Promise<GeneralResponseDTO<string>>;
}
