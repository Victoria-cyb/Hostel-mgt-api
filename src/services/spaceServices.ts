import { SpaceRepository } from "../repositories/space";
import { SpaceRole, type CreateSpaceInput } from "../types/space";


class SpaceService {
    private spaceRepository: SpaceRepository;

    constructor() {
        this.spaceRepository = new SpaceRepository();
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
            spaceUsers: true
          },
        });
      
        await this.spaceRepository.createSpaceUser({
          data: {
            userId: creatorId,
            spaceId: newSpace.id,
            role: SpaceRole.Admin,
            createdAt: new Date().toISOString(),
          },
        });
      
        return newSpace;
    };
      
}

export default SpaceService;