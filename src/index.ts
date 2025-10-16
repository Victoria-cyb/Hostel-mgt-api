import dotenv from "dotenv";
dotenv.config();
import express from "express";
import cors from "cors";
import apolloServer from "./graphql/setup";
import { expressMiddleware } from "@as-integrations/express5"; 
import { getToken, decodeToken } from "./utils/token";

class Server {
    private app: express.Application;
    private readonly PORT = process.env.PORT;

    constructor() {
        if (!this.PORT) {
            console.error("[Error]: PORT is missing");
            process.exit(1);
        }
        this.app = express();
        this.app.use(cors());
        this.app.use(express.json()); 

        this.startGqlServer();
    }

    private async startGqlServer() {
        await apolloServer.start();

        this.app.use(
            "/graphql",
            cors(),
            express.json(), // Ensure JSON parsing for GraphQL endpoint
            expressMiddleware(apolloServer, {
                context: async ({ req }) => {
                    const token = getToken(req);
                    let userId: string | null = null;

                    if (token) {
                        try {
                            const payload = decodeToken(token, process.env.LOGIN_SECRET!);
                             
                            userId = payload?.userId ?? null; // Adjust to your JWT payload structure
                        } catch (err) {
                            console.warn("Invalid token:", (err as Error).message);
                        }
                    }

                    return {
                        userId,
                        authToken: token,
                    };
                },
            }),
        );
    }

    public start() {
        this.app.listen(this.PORT, () =>
            console.log(`App running on port ${this.PORT}`),
        );
    }
}

const server = new Server();
server.start();