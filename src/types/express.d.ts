/* eslint-disable @typescript-eslint/no-unused-vars, no-unused-vars */
declare global {
  namespace Express {
    interface Request {
      user: {
        _id: string;
      };
    }
  }
}

export {};
