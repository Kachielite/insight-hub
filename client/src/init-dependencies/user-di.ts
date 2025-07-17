import axios from 'axios';
import { container } from 'tsyringe';

import UserEndpoints from '@/features/User/data/datasource/network/user.ts';
import {
  UserDataSource,
  UserDataSourceImpl,
} from '@/features/User/data/datasource/user-datasource.ts';
import UserRepositoryImpl from '@/features/User/data/repositories/user-repository-impl.ts';
import { UserRepository } from '@/features/User/domain/repositories/user-repository.ts';
import { GetUserUseCase } from '@/features/User/domain/use-case/get-user.ts';

export function configureUserContainer() {
  // Register axios client
  container.registerInstance('axiosClient', axios.create());

  // Register network layer
  container.registerSingleton<UserEndpoints>(UserEndpoints);

  // Register data source
  container.register<UserDataSource>('UserDataSource', {
    useClass: UserDataSourceImpl,
  });

  // Register repository
  container.register<UserRepository>('UserRepository', {
    useClass: UserRepositoryImpl,
  });

  // Register use cases
  container.registerSingleton<GetUserUseCase>(GetUserUseCase);
}

// Export use case classes for manual resolution
export { GetUserUseCase };

// Helper function to get configured use cases
export function getUserUseCases() {
  return {
    getUserUseCase: container.resolve(GetUserUseCase),
  };
}
