import { UserRole } from '@/src/common/types';
import { SetMetadata } from '@nestjs/common';

export const Roles = (...roles: UserRole[]) => SetMetadata('roles', roles);
