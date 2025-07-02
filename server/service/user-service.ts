import { UserCreationDTO, UserResponseDTO, UserUpdateDTO } from '@dto/user-dto';
import GeneralResponseDTO from '@dto/general-response-dto';
import PaginationResponseDTO from '@dto/pagination-response-dto';
import TokenDTO from '@dto/token-dto';

export interface UserService {
  registerUser(
    userData: UserCreationDTO
  ): Promise<GeneralResponseDTO<TokenDTO>>;
  findUserByEmail(email: string): Promise<GeneralResponseDTO<UserResponseDTO>>;
  findUserById(id: number): Promise<GeneralResponseDTO<UserResponseDTO>>;
  findAllUsers(
    page?: number,
    size?: number
  ): Promise<PaginationResponseDTO<UserResponseDTO>>;
  searchUsers(
    query: string,
    page?: number,
    size?: number
  ): Promise<PaginationResponseDTO<UserResponseDTO>>;
  updateUser(
    userData: UserUpdateDTO
  ): Promise<GeneralResponseDTO<UserResponseDTO>>;
  deleteUser(id: number): Promise<GeneralResponseDTO<string>>;
}
