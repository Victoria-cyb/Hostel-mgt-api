import SPACE_RESOLVER from "./spaceResolver";
import USER_RESOLVER from "./userResolver";
import HOSTEL_RESOLVERS from "./hostelResolver";
import APPLICATION_RESOLVERS from "./applicationResolver";
import ALLOCATION_RESOLVERS from "./allocationResolver";


const RESOLVERS = [
    USER_RESOLVER,
    SPACE_RESOLVER,
    HOSTEL_RESOLVERS,
    APPLICATION_RESOLVERS,
    ALLOCATION_RESOLVERS
];

export default RESOLVERS;