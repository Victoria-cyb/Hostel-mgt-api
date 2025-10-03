import { SpaceRepository } from "../repositories/space";
import { SpaceRole, type CreateSpaceInput, type CreateSpaceUserInput, Status } from "../types/space";
import type { Gender } from "../types/user";
import { UserRepository } from "../repositories/user";
import { encrypt } from "../utils/auth";
import { CustomError } from "../utils/error";


class SpaceService {
    private spaceRepository: SpaceRepository;
    private userRespository: UserRepository;

    constructor() {
        this.spaceRepository = new SpaceRepository();
        this.userRespository = new UserRepository();
    }


   

   createSpace = async (input: CreateSpaceInput, creatorId: string) => {
    const { name } = input;
    const newSpace = await this.spaceRepository.createSpace({
      data: {
        name,
        createdById: creatorId,
      },
      include: {
        createdBy: true,
        spaceUsers: true,
      },
    });

    await this.spaceRepository.createSpaceUser({
      data: {
        userId: creatorId,
        spaceId: newSpace.id,
        role: SpaceRole.Admin,
      },
    });

    return {
      ...newSpace,
      createdAt:
        newSpace.createdAt instanceof Date
          ? newSpace.createdAt.toISOString()
          : newSpace.createdAt,
      updatedAt:
        newSpace.updatedAt instanceof Date
          ? newSpace.updatedAt.toISOString()
          : newSpace.updatedAt,
    };
  };


    createSpaceUser = async (input: CreateSpaceUserInput, spaceId: string) => {

    //   const roleEnum: SpaceRole = SpaceRole[input.role.toLowerCase() as keyof typeof SpaceRole];

    //   if (!roleEnum) {
    //   throw new CustomError(`Invalid role: ${input.role}`);
    //  }

    const {
      firstName,
      lastName,
      email,
      password,
      phone,
      gender,
      image,
      classId,
      parentId: inputParentId,
      role,
    } = input;

    // Check if user already exists
   let user = email
    ? await this.userRespository.findUserByEmail({ where: { email } })
    : null;

    if (!user) {
      // Hash password
      const hashedPassword = await encrypt(password);
    const randomDigits = Math.floor(1000 + Math.random() * 9000);
    const username = `${firstName.toLowerCase()}${randomDigits}`;

      user = await this.userRespository.createUser({
        data: {
          firstName,
          lastName,
          email: email ?? null,
          phone: phone ?? null,
          gender,
          image: image ?? null,
          username: email || `${firstName.toLowerCase()}_${Date.now()}`,
          password: hashedPassword,
          
        },
        include: {
          spaces: true,
        }
      });
    }

    const existingSpaceUser = await this.spaceRepository.findSpaceUser({
    where: {
      spaceId,
      userId: user.id,
    },
  });

  if (existingSpaceUser) {
    throw new CustomError("User is already a member of this space");
  }

  let parentId: string | null = null;

  if (role === SpaceRole.Parent) {
    parentId = null;
  }

  if (role === SpaceRole.Student && inputParentId) {
    const parentSpaceUser = await this.spaceRepository.findSpaceUser({
      where: { id: inputParentId, spaceId },
      include: { user: true },
    });

    if (!parentSpaceUser || parentSpaceUser.role !== SpaceRole.Parent) {
      throw new CustomError("Parent user not found or not a parent");
    }

    parentId = parentSpaceUser.id;
  }

  

    // Create SpaceUser relation
    const spaceUser = await this.spaceRepository.createSpaceUser({
      data: {
        userId: user.id,
        spaceId,
        role: input.role as SpaceRole,
        classId: classId ?? null,
        parentId: parentId ?? null,
      },
      include: {
        user: true,
        space: true,
      },
    });

    return {
      ...spaceUser,
      user: {
        ...spaceUser.user,
        gender: spaceUser.user.gender as Gender,
       resetOtpExpiry: spaceUser.user.resetOtpExpiry
      ? spaceUser.user.resetOtpExpiry.toISOString()
      : null,
      },
      createdAt:
        spaceUser.createdAt instanceof Date
          ? spaceUser.createdAt.toISOString()
          : spaceUser.createdAt,
      updatedAt:
        spaceUser.updatedAt instanceof Date
          ? spaceUser.updatedAt.toISOString()
          : spaceUser.updatedAt,
    };
  };

  getSpaceById = async (id: string) => {
  const space = await this.spaceRepository.findSpaceById({
    where: { id },
    include: {
      hostels: true,
      spaceUsers: true,
      stayTypes: true,
      classes: {
        include: {
          // include the relation so we have the nested class.space from prisma if present
          space: {
            include: {
              hostels: true,
              spaceUsers: true,
              stayTypes: true,
              createdBy: true,
              classes: true,
            },
          },
        },
      },
      createdBy: true,
    },
  });

  if (!space) throw new CustomError("Space not found");

  // helper to normalize date -> ISO string
  const toISO = (d: any) =>
    d instanceof Date ? d.toISOString() : (d as string | undefined);

  // Build the mappedSpace (FULL shape expected by GraphQL)
  const mappedSpace: any = {
    id: space.id,
    name: space.name,
    createdAt: toISO(space.createdAt),
    // NOTE: GraphQL Space doesn't include updatedAt in your schema; omit it
    createdById: space.createdById,
    createdBy: space.createdBy
      ? {
          id: space.createdBy.id,
          firstName: space.createdBy.firstName,
          lastName: space.createdBy.lastName,
          email: space.createdBy.email ?? null,
        }
      : null, // adjust if createdBy must be non-null
    hostels: (space.hostels ?? []).map((h: any) => ({
      id: h.id,
      name: h.name,
      createdAt: toISO(h.createdAt),
      updatedAt: toISO(h.updatedAt),
      gender: h.gender,
      location: h.location ?? null,
      status: h.status,
      roomCount: h.roomCount ?? 0,
      availableBeds: h.availableBeds ?? 0,
      spaceId: h.spaceId ?? null,
    })),
    stayTypes: (space.stayTypes ?? []).map((st: any) => ({
      ...st,
      createdAt: toISO(st.createdAt),
      updatedAt: toISO(st.updatedAt),
    })),
    // placeholder arrays we'll fill next
    users: [],
    classes: [],
  };

  // Map users (spaceUsers) into GraphQL-compatible SpaceUser
  mappedSpace.users = (space.spaceUsers ?? []).map((su: any) => ({
    id: su.id,
    role: su.role,
    user: {
      id: su.user?.id ?? su.userId ?? "", // depending on include
      firstName: su.user?.firstName ?? "",
      lastName: su.user?.lastName ?? "",
      email: su.user?.email ?? null,
    },
    space: { id: mappedSpace.id, name: mappedSpace.name }, // SimpleSpaceInfo as GraphQL expects inside SpaceUser
    createdAt: toISO(su.createdAt),
    updatedAt: toISO(su.updatedAt),
    // include optional fields GraphQL expects (applications/allocations/class/parent) if you have them, else empty defaults
    applications: su.applications ?? [],
    allocations: su.allocations ?? [],
    class: su.classId ? { id: su.classId, name: su.class?.name ?? "", createdAt: toISO(su.class?.createdAt) } : null,
    parent: su.parent ? { id: su.parent.id, firstName: su.parent.firstName, lastName: su.parent.lastName, email: su.parent.email ?? null } : null,
  }));

  // Map classes — *important*: set class.space to the full mappedSpace object
  mappedSpace.classes = (space.classes ?? []).map((c: any) => {
    const mappedClass = {
      id: c.id,
      name: c.name,
      createdAt: toISO(c.createdAt),
      // The GraphQL Class.space expects a full Space — point to mappedSpace
      space: mappedSpace,
    };
    return mappedClass;
  });

  // If any of the mapped nested objects (like class.space) had their own classes/users included
  // and you want them to reflect mappedSpace.classes/users, you may need to update them, but
  // pointing to mappedSpace above will satisfy the GraphQL type system.

  return mappedSpace;
};

 getSpaceUserRole = async (userId: string, spaceId: string) => {
    const spaceUser = await this.spaceRepository.findSpaceUsers({
      where: { userId, spaceId },
      take: 1,
    });

    if (!spaceUser.length) {
      throw new CustomError("User is not part of this space");
    }

    return spaceUser[0]?.role;
  };

   linkParentToStudent = async (
    spaceId: string,
    parentId: string,
    studentId: string,
  ): Promise<boolean> => {
    const parentUser = await this.spaceRepository.findSpaceUsers({
      where: { id: parentId, spaceId },
      take: 1,
    });

    const studentUser = await this.spaceRepository.findSpaceUsers({
      where: { id: studentId, spaceId },
      take: 1,
    });

    if (!parentUser.length)
      throw new Error("Parent user not found in any space");
    if (!studentUser.length)
      throw new Error("Student user not found in any space");

    const student = studentUser[0]!;
    const parent = parentUser[0]!;

    await this.spaceRepository.updateSpaceUser({
      where: { id: student.id },
      data: { parentId: parent.id },
    });

    return true;
  };

   createClass = async (spaceId: string, name: string) => {
    const space = await this.spaceRepository.findSpaceById({
      where: { id: spaceId },
      include: { createdBy: true },
    });
    if (!space) throw new CustomError("Space not found");

    const newClassInstance = await this.spaceRepository.createClass({
      data: { name, spaceId, createdAt: new Date() },
      include: { space: { include: { createdBy: true } } },
    });

    return {
      ...newClassInstance,
      createdAt:
        newClassInstance.createdAt instanceof Date
          ? newClassInstance.createdAt.toISOString()
          : newClassInstance.createdAt,
    
      space: {
        id: space.id,
        name: space.name,
        createdAt:
          space.createdAt instanceof Date
            ? space.createdAt.toISOString()
            : space.createdAt,
        updatedAt:
          space.updatedAt instanceof Date
            ? space.updatedAt.toISOString()
            : space.updatedAt,
        createdById: space.createdById,
        createdBy: {
          id: space.createdBy.id,
          firstName: space.createdBy.firstName,
          lastName: space.createdBy.lastName,
          email: space.createdBy.email,
        },
        users: [],
        classes: [],
        hostels: [],
        stayTypes: [],
      },
    };
  };

  getSpacesForUser = async (userId: string) => {
    const spaceUsers = await this.spaceRepository.findSpaceUsers({
      where: { userId },
      include: { space: { include: { createdBy: true } } },
    });

    const spaces = spaceUsers.map((su) => {
      const space = su.space;

      return {
        id: space.id,
        name: space.name,
        createdAt:
          space.createdAt instanceof Date
            ? space.createdAt.toISOString()
            : space.createdAt,
        updatedAt:
          space.updatedAt instanceof Date
            ? space.updatedAt.toISOString()
            : space.updatedAt,
        createdById: space.createdById,
        createdBy: {
          id: space.createdBy.id,
          firstName: space.createdBy.firstName,
          lastName: space.createdBy.lastName,
          email: space.createdBy.email,
        },
        users: [],
        classes: [],
        hostels: [],
        stayTypes: [],
      };
    });

    return spaces;
  };

   getPublicSpaces = async () => {
    const spaces = await this.spaceRepository.findSpaces({
      include: {
        hostels: true,
      },
    });

    return spaces.map((s) => ({
      id: s.id,
      name: s.name,
      hostels: s.hostels.map((h) => ({
        id: h.id,
        name: h.name,
        gender: h.gender as Gender,
        status: h.status as Status,
        roomCount: h.roomCount,
        availableBeds: h.availableBeds,
      })),
    }));
  };

   getPublicSpaceById = async (id: string) => {
    const space = await this.spaceRepository.findSpaceById({
      where: { id },
      include: {
        hostels: true,
      },
    });

    if (!space) throw new Error("Public space not found");

    return {
      id: space.id,
      name: space.name,
      hostels: space.hostels.map((h) => ({
        id: h.id,
        name: h.name,
        gender: h.gender as Gender,
        status: h.status as Status,
        roomCount: h.roomCount,
        availableBeds: h.availableBeds,
      })),
    };
  };

   getClassesForSpace = async (spaceId: string) => {
    const classesRaw = await this.spaceRepository.findClasses({
      where: { spaceId },
      include: {
        space: {
          include: { createdBy: true },
        },
      },
    });

    return classesRaw.map((c) => ({
      id: c.id,
      name: c.name,
      createdAt:
        c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
      username: c.name.replace(/\s+/g, "").toLowerCase(),
      space: {
        id: c.space.id,
        name: c.space.name,
        createdAt:
          c.space.createdAt instanceof Date
            ? c.space.createdAt.toISOString()
            : c.space.createdAt,
        updatedAt:
          c.space.updatedAt instanceof Date
            ? c.space.updatedAt.toISOString()
            : c.space.updatedAt,
        createdById: c.space.createdById,
        createdBy: {
          id: c.space.createdBy.id,
          firstName: c.space.createdBy.firstName,
          lastName: c.space.createdBy.lastName,
          email: c.space.createdBy.email,
        },
        users: [],
        hostels: [],
        stayTypes: [],
        classes: [],
      },
    }));
  };

  getClassById = async (id: string) => {
    const c = await this.spaceRepository.findClassById({
      where: { id },
      include: {
        space: { include: { createdBy: true } },
      },
    });

    if (!c) return null;

    return {
      id: c.id,
      name: c.name,
      createdAt:
        c.createdAt instanceof Date ? c.createdAt.toISOString() : c.createdAt,
      space: {
        id: c.space.id,
        name: c.space.name,
        createdAt:
          c.space.createdAt instanceof Date
            ? c.space.createdAt.toISOString()
            : c.space.createdAt,
        updatedAt:
          c.space.updatedAt instanceof Date
            ? c.space.updatedAt.toISOString()
            : c.space.updatedAt,
        createdById: c.space.createdById,
        createdBy: {
          id: c.space.createdBy.id,
          firstName: c.space.createdBy.firstName,
          lastName: c.space.createdBy.lastName,
          email: c.space.createdBy.email,
        },
        users: [],
        hostels: [],
        stayTypes: [],
        classes: [],
      },
    };
  };
      
}

export default SpaceService;