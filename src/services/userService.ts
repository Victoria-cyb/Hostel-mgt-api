import { UserRepository } from "../repositories/user"
import { type CreateUserInput, type User } from "../types/user";
import { compare, encrypt } from "../utils/auth";
import { CustomError } from "../utils/error";
import { generateToken } from "../utils/token";

class UserService {
    private userRepository: UserRepository;

    constructor() {
        this.userRepository = new UserRepository();
    }
    
    getUserById = async (userId: string): Promise<User> => {
        const user = await this.userRepository.findUserById({
            where: {id: userId},
            include: {
                spaces: true
            },
        });

        if (!user) throw new CustomError("User not found");

        const { spaces, ...userData } = user as any;
        return {
            ...userData,
            spaces: spaces ?? [],
            role: user.role as unknown as User["role"],
        } as User;
    }

    signUp = async (input: CreateUserInput) => {
        const { firstName, lastName, email, password, phone } = input;
      
        // 1. Check if user already exists by email
        const existingUser = await this.userRepository.findUserByEmail({
          where: { email },
        });
        if (existingUser) {
          throw new CustomError("User with this email already exists");
        }
      
        // 2. Encrypt password
        const hashedPassword = await encrypt(password);
      
        // 3. Generate username (firstname + 4 random digits)
        const randomDigits = Math.floor(1000 + Math.random() * 9000); // 4-digit number
        const username = `${firstName.toLowerCase()}${randomDigits}`;
      
        // 4. Create new user
        const newUser = await this.userRepository.createUser({
          data: {
            firstName,
            lastName,
            email,
            phone: phone ?? null,
            password: hashedPassword,
            username,
          },
        });
      
        // 5. Generate token
        const token = generateToken(
          { userId: newUser.id },
          process.env.LOGIN_SECRET!,
          "7d"
        );
      
        return token;
    };    
      
    login = async (identifier: string, password: string) => {
        // Try to find user by email first, then by username if not found
        let user = await this.userRepository.findUserByEmail({
            where: { email: identifier.toLowerCase() },
        });

        if (!user) {
            user = await this.userRepository.findUserByUsername({
                where: { username: identifier },
            });
        }
        if (!user) {
          throw new CustomError("Invalid credentials");
        }

        if (typeof user.password !== "string") {
          throw new CustomError("Invalid credentials");
        }
        const isValid = await compare(password, user.password);
        if (!isValid) {
          throw new CustomError("Invalid credentials");
        }
        const token = generateToken(
          { userId: user.id },
          process.env.LOGIN_SECRET!,
          "7d"
        );
      
        return token;
      };
      
      
}

export default UserService;