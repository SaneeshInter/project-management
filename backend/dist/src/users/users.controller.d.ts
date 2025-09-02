import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class UsersController {
    private readonly usersService;
    constructor(usersService: UsersService);
    create(createUserDto: CreateUserDto): Promise<{
        departmentMaster: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        };
        roleMaster: {
            name: string;
            description: string | null;
            departmentId: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        name: string;
        email: string;
        password: string;
        roleId: string | null;
        departmentId: string | null;
        avatar: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        department: import(".prisma/client").$Enums.Department | null;
        role: import(".prisma/client").$Enums.Role;
    }>;
    findAll(): Promise<({
        departmentMaster: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        };
        roleMaster: {
            name: string;
            description: string | null;
            departmentId: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        name: string;
        email: string;
        password: string;
        roleId: string | null;
        departmentId: string | null;
        avatar: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        department: import(".prisma/client").$Enums.Department | null;
        role: import(".prisma/client").$Enums.Role;
    })[]>;
    findOne(id: string): Promise<{
        departmentMaster: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        };
        roleMaster: {
            name: string;
            description: string | null;
            departmentId: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        name: string;
        email: string;
        password: string;
        roleId: string | null;
        departmentId: string | null;
        avatar: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        department: import(".prisma/client").$Enums.Department | null;
        role: import(".prisma/client").$Enums.Role;
    }>;
    update(id: string, updateUserDto: UpdateUserDto): Promise<{
        departmentMaster: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        };
        roleMaster: {
            name: string;
            description: string | null;
            departmentId: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        name: string;
        email: string;
        password: string;
        roleId: string | null;
        departmentId: string | null;
        avatar: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        department: import(".prisma/client").$Enums.Department | null;
        role: import(".prisma/client").$Enums.Role;
    }>;
    remove(id: string, force?: string): Promise<{
        message: string;
    }>;
    getPMOCoordinators(): Promise<({
        departmentMaster: {
            name: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
            parentId: string | null;
        };
        roleMaster: {
            name: string;
            description: string | null;
            departmentId: string;
            id: string;
            code: string;
            isActive: boolean;
            createdAt: Date;
            updatedAt: Date;
        };
    } & {
        name: string;
        email: string;
        password: string;
        roleId: string | null;
        departmentId: string | null;
        avatar: string | null;
        id: string;
        createdAt: Date;
        updatedAt: Date;
        department: import(".prisma/client").$Enums.Department | null;
        role: import(".prisma/client").$Enums.Role;
    })[]>;
}
