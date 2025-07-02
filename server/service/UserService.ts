import { UserResponseDTO, UserUpdateDTO } from '@dto/UserDTO';
import GeneralResponseDTO from '@dto/GeneralResponseDTO';

export interface UserService {
  findUserById(id: number): Promise<GeneralResponseDTO<UserResponseDTO>>;
  updateUser(
    userData: UserUpdateDTO
  ): Promise<GeneralResponseDTO<UserResponseDTO>>;
  deleteUser(id: number): Promise<GeneralResponseDTO<string>>;
}
