import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        departmentMaster: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        };
        roleMaster: {
            id: string;
            name: string;
            code: string;
            description: string | null;
            departmentId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        name: string;
        departmentId: string | null;
        createdAt: Date;
        updatedAt: Date;
        department: import(".prisma/client").$Enums.Department | null;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        avatar: string | null;
        roleId: string | null;
    }>;
    findAll(): Promise<({
        departmentMaster: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        };
        roleMaster: {
            id: string;
            name: string;
            code: string;
            description: string | null;
            departmentId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        name: string;
        departmentId: string | null;
        createdAt: Date;
        updatedAt: Date;
        department: import(".prisma/client").$Enums.Department | null;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        avatar: string | null;
        roleId: string | null;
    })[]>;
    findOne(id: string): Promise<{
        departmentMaster: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        };
        roleMaster: {
            id: string;
            name: string;
            code: string;
            description: string | null;
            departmentId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        name: string;
        departmentId: string | null;
        createdAt: Date;
        updatedAt: Date;
        department: import(".prisma/client").$Enums.Department | null;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        avatar: string | null;
        roleId: string | null;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        departmentMaster: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        };
        roleMaster: {
            id: string;
            name: string;
            code: string;
            description: string | null;
            departmentId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        name: string;
        departmentId: string | null;
        createdAt: Date;
        updatedAt: Date;
        department: import(".prisma/client").$Enums.Department | null;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        avatar: string | null;
        roleId: string | null;
    }>;
    remove(id: string, force?: string): Promise<{
        message: string;
    }>;
    getPMOCoordinators(): Promise<({
        departmentMaster: {
            id: string;
            name: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
            order: number;
        };
        roleMaster: {
            id: string;
            name: string;
            code: string;
            description: string | null;
            departmentId: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        id: string;
        name: string;
        departmentId: string | null;
        createdAt: Date;
        updatedAt: Date;
        department: import(".prisma/client").$Enums.Department | null;
        email: string;
        password: string;
        role: import(".prisma/client").$Enums.Role;
        avatar: string | null;
        roleId: string | null;
    })[]>;
}
