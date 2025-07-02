import GeneralResponseDTO from '@dto/general-response-dto';
import PaginationResponseDTO from '@dto/pagination-response-dto';
import TokenDTO from '@/dto/token-dto';
import {
  UserCreationDTO,
  UserResponseDTO,
  UserUpdateDTO,
} from '@/dto/user-dto';
import { UserService } from '@/service/user-service';

class UserServiceImplementation implements UserService {
  registerUser(
    userData: UserCreationDTO
  ): Promise<GeneralResponseDTO<TokenDTO>> {
    console.log(userData);
    throw new Error('Method not implemented.');
  }
  findUserByEmail(email: string): Promise<GeneralResponseDTO<UserResponseDTO>> {
    console.log(email);
    throw new Error('Method not implemented.');
  }
  findUserById(id: number): Promise<GeneralResponseDTO<UserResponseDTO>> {
    console.log(id);
    throw new Error('Method not implemented.');
  }
  findAllUsers(
    page?: number,
    size?: number
  ): Promise<PaginationResponseDTO<UserResponseDTO>> {
    console.log(page, size);
    throw new Error('Method not implemented.');
  }
  searchUsers(
    query: string,
    page?: number,
    size?: number
  ): Promise<PaginationResponseDTO<UserResponseDTO>> {
    console.log(query, page, size);
    throw new Error('Method not implemented.');
  }
  updateUser(
    userData: UserUpdateDTO
  ): Promise<GeneralResponseDTO<UserResponseDTO>> {
    console.log(userData);
    throw new Error('Method not implemented.');
  }
  deleteUser(id: number): Promise<GeneralResponseDTO<string>> {
    console.log(id);
    throw new Error('Method not implemented.');
  }
}

export default UserServiceImplementation;
