import { UserCreationDTO, UserResponseDTO, UserUpdateDTO } from '@dto/user-dto';
import GeneralResponseDTO from '@dto/general-response-dto';
import PaginationResponseDto from '@dto/pagination-response-dto';
import TokenDto from '@dto/token-dto';

export interface UserService {
  registerUser(
    userData: UserCreationDTO
  ): Promise<GeneralResponseDTO<TokenDto>>;
  findUserByEmail(email: string): Promise<GeneralResponseDTO<UserResponseDTO>>;
  findUserById(id: number): Promise<GeneralResponseDTO<UserResponseDTO>>;
  findAllUsers(
    page?: number,
    size?: number
  ): Promise<PaginationResponseDto<UserResponseDTO>>;
  searchUsers(
    query: string,
    page?: number,
    size?: number
  ): Promise<PaginationResponseDto<UserResponseDTO>>;
  updateUser(
    userData: UserUpdateDTO
  ): Promise<GeneralResponseDTO<UserResponseDTO>>;
  deleteUser(id: number): Promise<GeneralResponseDTO<string>>;
}

export default UserService;
